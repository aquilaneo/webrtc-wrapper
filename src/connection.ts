import { ReceiveMediaChannel, SendMediaChannel } from "./media-channel.ts";
import { DataChannel } from "./data-channel.ts";
import { IceMode, SignalingManager } from "./signaling.ts";

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

    // offerとしてP2P接続を開始する
    // TODO: 戻り値を消す
    public async connectAsOffer() {
        return await this.signalingManager.createOffer();
    }

    // 相手のanswerを登録する
    // TODO: 消す
    public async setRemoteAnswer(remoteAnswerSdp: string) {
        await this.signalingManager.setRemoteAnswer(remoteAnswerSdp);
    }

    // answerとしてP2P接続を開始する
    // TODO: 戻り値・引数を消す
    public async connectAsAnswer(remoteOfferSdp: string) {
        await this.signalingManager.setRemoteOffer(remoteOfferSdp);
        return await this.signalingManager.createAnswer();
    }

    // SendMediaChannelを追加する
    public addSendMediaChannel(label: string, sendMediaChannel: SendMediaChannel) {
        // すでに存在していたら何もしない
        if (this.sendMediaChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.sendMediaChannels.set(label, sendMediaChannel);
    }

    // SendMediaChannelを取得する
    public getSendMediaChannel(label: string) {
        return this.sendMediaChannels.get(label);
    }

    // SendMediaChannelを削除する
    public removeSendMediaChannel(label: string) {
        // 存在しなかったら何もしない
        if (!this.sendMediaChannels.has(label)) {
            console.error(`${label}は存在しません。`);
            return;
        }

        this.sendMediaChannels.delete(label);
    }

    // ReceiveMediaChannelを追加する
    private addReceiveMediaChannel(label: string, receiveMediaChannel: ReceiveMediaChannel) {
        // すでに存在していたら何もしない
        if (this.receiveMediaChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.receiveMediaChannels.set(label, receiveMediaChannel);
    }

    // ReceiveMediaChannelを取得する
    public getReceivedMediaChannel(label: string) {
        return this.receiveMediaChannels.get(label);
    }

    // ReceiveMediaChannelを削除する
    private removeReceiveMediaChannel(label: string) {
        // 存在しなかったら何もしない
        if (!this.receiveMediaChannels.has(label)) {
            console.error(`${label}は存在しません。`);
            return;
        }

        this.receiveMediaChannels.delete(label);
    }

    // DataChannelを作成する
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

    // DataChannelを取得する
    public getDataChannel(label: string) {
        return this.dataChannels.get(label);
    }

    // DataChannelを削除する
    public removeDataChannel(label: string) {
        // 存在しなかったら何もしない
        if (!this.dataChannels.has(label)) {
            console.error(`${label}は存在しません。`);
            return;
        }

        this.dataChannels.delete(label);
    }

    // テスト用DataChannel送信
    // TODO: 消す
    public sendApplicationDataChannel(message: string) {
        if (!this.applicationDataChannel) {
            return;
        }

        this.applicationDataChannel.sendText(message);
    }
}
