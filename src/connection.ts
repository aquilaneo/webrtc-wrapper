import { ReceiveMediaChannel, SendMediaChannel } from "./media-channel.ts";
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
    private applicationDataChannel: DataChannel;

    private readonly peerConnection: RTCPeerConnection;

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
                { urls: ["stun:stun.l.google.com:19302"] }
            ]
        });

        // アプリケーション用DataChannel
        const rtcDataChannel = this.peerConnection.createDataChannel("application", {
            id: 0, negotiated: true
        });
        this.applicationDataChannel = new DataChannel(rtcDataChannel);
        this.applicationDataChannel.onTextMessage = (message: string) => {
            console.log(message);
        };


        this.targetClientId = targetClientId;
        this.signalingManager = new SignalingManager(this.peerConnection, iceMode);
        this.sendMediaChannels = new Map<string, SendMediaChannel>();
        this.receiveMediaChannels = new Map<string, ReceiveMediaChannel>();
        this.dataChannels = new Map<string, DataChannel>();

        // イベントハンドラ
        this.onNewReceiveMediaChannel = () => {
        };
        this.onNewDataChannel = () => {
        };
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
    public addSendMediaChannel(label: string, sendMediaChannel: SendMediaChannel) {
        // すでに存在していたら何もしない
        if (this.sendMediaChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.sendMediaChannels.set(label, sendMediaChannel);
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
     * DataChannelを作成する
     * @param label 作成するDataChannelのラベル文字列
     * @return {DataChannel | undefined} 作成したDataChannel
     */
    public createDataChannel(label: string) {
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
