import { ReceiveMediaChannel, SendMediaChannel, VideoCodec, AudioCodec } from "./media-channel.ts";
import { DataChannel } from "./data-channel.ts";
import { IceMode, SignalingManager } from "./signaling.ts";

/**
 * ===== 1つのWebRTC接続を管理 =====
 */
export class Connection {
    private targetClientId: string;
    private signalingManager: SignalingManager;
    private sendMediaChannels: Map<string, SendMediaChannel>;
    private receiveMediaChannels: Map<string, ReceiveMediaChannel>;
    private dataChannels: Map<string, DataChannel>;
    private readonly applicationDataChannel: DataChannel;
    private readonly signalingDataChannel: DataChannel;

    private peerConnection: RTCPeerConnection | null;

    // イベントハンドラ
    public onNewReceiveMediaChannel: (label: string, receiveMediaChannel: ReceiveMediaChannel) => void;
    public onNewDataChannel: (label: string, dataChannel: DataChannel) => void;

    /**
     * コンストラクタ
     * @param targetClientId 接続相手のID
     * @param iceMode シグナリングに VanillaICE と TricleICE のどちらを使うか
     */
    public constructor(targetClientId: string, iceMode: IceMode) {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: ["stun:stun.services.mozilla.com:3478"] }
            ]
        });

        // アプリケーション用DataChannel
        const rawApplicationDataChannel = this.peerConnection.createDataChannel("application", {
            id: 0, negotiated: true
        });
        this.applicationDataChannel = new DataChannel(rawApplicationDataChannel);
        this.applicationDataChannel.onTextMessage = (message: string) => {
            console.log(message);
        };

        // シグナリング用DataChannel
        const rawSignalingDataChannel = this.peerConnection.createDataChannel("signaling", {
            id: 1, negotiated: true
        });
        this.signalingDataChannel = new DataChannel(rawSignalingDataChannel);

        this.targetClientId = targetClientId;
        this.signalingManager = new SignalingManager(this.peerConnection, this.signalingDataChannel, iceMode);
        this.sendMediaChannels = new Map<string, SendMediaChannel>();
        this.receiveMediaChannels = new Map<string, ReceiveMediaChannel>();
        this.dataChannels = new Map<string, DataChannel>();

        // 接続完了したら自動再シグナリングを有効にする
        this.peerConnection.onconnectionstatechange = () => {
            if (this.peerConnection?.connectionState === "connected") {
                this.signalingManager.enableAutoReSignaling();
            }
        };

        // イベントハンドラ
        this.onNewReceiveMediaChannel = () => {
        };
        this.onNewDataChannel = () => {
        };

        this.peerConnection.ontrack = (e) => {
            // TODO: ReceiveMediaStreamを生成するようにする
            const elem = document.getElementById("remote-video") as HTMLVideoElement;
            elem.srcObject = e.streams[0];
            elem.muted = true;
            elem.ondurationchange = () => {
                elem.play();
            };
        }
    }

    /**
     * 接続終了
     */
    public closeConnection() {
        if (!this.peerConnection) {
            return;
        }

        // 切断処理
        this.peerConnection.close();
        this.peerConnection = null;
    }

    /**
     * offerとしてP2P接続を開始する
     * TODO: 戻り値を消す
     */
    public async connectAsOffer() {
        return await this.signalingManager.createOffer();
    }

    /**
     * 相手のanswerを登録する
     * TODO: 消す
     */
    public async setRemoteAnswer(remoteAnswerSdp: string) {
        await this.signalingManager.setRemoteAnswer(remoteAnswerSdp);
    }

    /**
     * answerとしてP2P接続を開始する
     * TODO: 戻り値・引数を消す
     */
    public async connectAsAnswer(remoteOfferSdp: string) {
        await this.signalingManager.setRemoteOffer(remoteOfferSdp);
        return await this.signalingManager.createAnswer();
    }

    /**
     * SendMediaChannelを追加する
     * @param label 追加するMediaChannelのラベル文字列
     * @param sendMediaChannel 追加するSendMediaChannel
     */
    public async addSendMediaChannel(label: string, sendMediaChannel: SendMediaChannel) {
        if (!this.peerConnection) {
            return;
        }

        // すでに存在していたら何もしない
        if (this.sendMediaChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.sendMediaChannels.set(label, sendMediaChannel);

        // 送信処理
        const mediaStream = sendMediaChannel.mediaStream;
        const newSenders: RTCRtpSender[] = [];
        for (const track of mediaStream.getTracks()) {
            const sender = this.peerConnection.addTrack(track, mediaStream);
            newSenders.push(sender);
        }

        // 新しく作られたSenderにコーデックの指定を適用する
        for (const sender of newSenders) {
            // senderから対応するTransceiverを取得する
            const targetTransceiver = this.findSenderFromTransceiver(sender);
            if (!targetTransceiver) {
                continue;
            }

            // メディアタイプで分岐
            if (sender.track?.kind === "video" && sendMediaChannel.mediaCodecPriority?.video) {
                this.setMediaChannelVideoCodec(targetTransceiver, sendMediaChannel.mediaCodecPriority.video);
            } else if (sender.track?.kind === "audio" && sendMediaChannel.mediaCodecPriority?.audio) {
                this.setMediaChannelAudioCodec(targetTransceiver, sendMediaChannel.mediaCodecPriority.audio);
            }
        }

        // 新しく作られたSenderに目標ビットレートを指定する
        for (const sender of newSenders) {
            if (!sendMediaChannel.targetMediaBitrate?.video && !sendMediaChannel.targetMediaBitrate?.audio) {
                continue;
            }

            const parameters = sender.getParameters();
            if (sender.track?.kind === "video" && sendMediaChannel.targetMediaBitrate?.video) {
                parameters.encodings[0].maxBitrate = sendMediaChannel.targetMediaBitrate.video * 1024;
            } else if (sender.track?.kind === "audio" && sendMediaChannel.targetMediaBitrate?.audio) {
                parameters.encodings[0].maxBitrate = sendMediaChannel.targetMediaBitrate.audio * 1024;
            }
            await sender.setParameters(parameters);
        }
    }

    /**
     * SendMediaChannelを取得する
     * @param label 取得するMediaChannelのラベル文字列
     * @return {SendMediaChannel | undefined} 取得したSendMediaChannel
     */
    public getSendMediaChannel(label: string) {
        return this.sendMediaChannels.get(label);
    }

    /**
     * SendMediaChannelを削除する
     * @param label 削除するMediaChannelのラベル文字列
     */
    public removeSendMediaChannel(label: string) {
        // 存在しなかったら何もしない
        if (!this.sendMediaChannels.has(label)) {
            console.error(`${label}は存在しません。`);
            return;
        }

        this.sendMediaChannels.delete(label);
    }

    /**
     * ReceiveMediaChannelを追加する
     * @param label 追加するMediaChannelのラベル文字列
     * @param receiveMediaChannel 追加するReceiveMediaChannel
     */
    private addReceiveMediaChannel(label: string, receiveMediaChannel: ReceiveMediaChannel) {
        // すでに存在していたら何もしない
        if (this.receiveMediaChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.receiveMediaChannels.set(label, receiveMediaChannel);
    }

    /**
     * ReceiveMediaChannelを取得する
     * @param label 取得するMediaChannelのラベル文字列
     * @return {ReceiveMediaChannel | undefined} 取得したReceiveMediaChannel
     */
    public getReceivedMediaChannel(label: string) {
        return this.receiveMediaChannels.get(label);
    }

    /**
     * ReceiveMediaChannelを削除する
     * @param label 削除するMediaChannelのラベル文字列
     */
    private removeReceiveMediaChannel(label: string) {
        // 存在しなかったら何もしない
        if (!this.receiveMediaChannels.has(label)) {
            console.error(`${label}は存在しません。`);
            return;
        }

        this.receiveMediaChannels.delete(label);
    }

    /**
     * 送信動画コーデックを指定
     * @param targetTransceiver コーデックを指定するRTCRtpTransceiver
     * @param videoCodecPriority 動画コーデックの優先度
     */
    private setMediaChannelVideoCodec(targetTransceiver: RTCRtpTransceiver, videoCodecPriority: VideoCodec[]) {
        // 対応コーデックを取得
        const capabilities = RTCRtpSender.getCapabilities("video");
        if (!capabilities) {
            return;
        }
        const codecCapabilities = capabilities.codecs;

        // 優先度順に使用するコーデックを抜き出す
        let newCodecCapabilities: RTCRtpCodecCapability[] = [];
        for (const useVideoCodec of videoCodecPriority) {
            const adaptedCodecs = codecCapabilities.filter((item) => {
                return item.mimeType.includes(useVideoCodec);
            });
            newCodecCapabilities = newCodecCapabilities.concat(adaptedCodecs);
        }

        targetTransceiver.setCodecPreferences(newCodecCapabilities);
    }

    /**
     * 送信音声コーデックを指定
     * @param targetTransceiver コーデックを指定するRTCRtpTransceiver
     * @param audioCodecPriority 音声コーデックの優先度
     */
    private setMediaChannelAudioCodec(targetTransceiver: RTCRtpTransceiver, audioCodecPriority: AudioCodec[]) {
        // TODO: 実装する
    }

    // senderからtransceiverを取得する
    private findSenderFromTransceiver(sender: RTCRtpSender) {
        if (!this.peerConnection) {
            return undefined;
        }

        const transceivers = this.peerConnection.getTransceivers();
        return transceivers.find((item) => {
            return item.sender === sender;
        });
    }

    /**
     * DataChannelを作成する
     * @param label 作成するDataChannelのラベル文字列
     * @return {DataChannel | undefined} 作成したDataChannel
     */
    public createDataChannel(label: string) {
        if (!this.peerConnection) {
            return;
        }

        // すでに存在していたら何もしない
        if (this.dataChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        const rtcDataChannel = this.peerConnection.createDataChannel(label);
        const dataChannel = new DataChannel(rtcDataChannel);
        this.dataChannels.set(label, dataChannel);

        return dataChannel;
    }

    /**
     * DataChannelを取得する
     * @param label 取得するDataChannelのラベル文字列
     * @return {DataChannel | undefined} 取得したDataChannel
     */
    public getDataChannel(label: string) {
        return this.dataChannels.get(label);
    }

    /**
     * DataChannelを削除する
     * @param label 削除するDataChannelのラベル文字列
     */
    public removeDataChannel(label: string) {
        // 存在しなかったら何もしない
        if (!this.dataChannels.has(label)) {
            console.error(`${label}は存在しません。`);
            return;
        }

        this.dataChannels.delete(label);
    }

    /**
     * テスト用DataChannel送信
     * TODO: 消す
     */
    public sendApplicationDataChannel(message: string) {
        if (!this.applicationDataChannel) {
            return;
        }

        this.applicationDataChannel.sendText(message);
    }
}
