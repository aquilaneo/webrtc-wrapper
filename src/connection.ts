import { ReceiveMediaChannel, SendMediaChannel } from "./media-channel.ts";
import { ReceiveDataChannel, SendDataChannel } from "./data-channel.ts";
import { SignalingManager, IceMode } from "./signaling.ts";

export class Connection {
    private targetClientId: string;
    private signalingManager: SignalingManager;
    private sendMediaChannels: Map<string, SendMediaChannel>;
    private receiveMediaChannels: Map<string, ReceiveMediaChannel>;
    private sendDataChannels: Map<string, SendDataChannel>;
    private receiveDataChannels: Map<string, ReceiveDataChannel>;
    private applicationDataChannel: RTCDataChannel | null;

    private readonly peerConnection: RTCPeerConnection;

    // イベントハンドラ
    public onNewReceiveMediaChannel: (label: string, receiveMediaChannel: ReceiveMediaChannel) => void;
    public onNewReceiveDataChannel: (label: string, receiveDataChannel: ReceiveDataChannel) => void;

    public constructor(targetClientId: string, iceMode: IceMode) {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: ["stun:stun.l.google.com:19302"] }
            ]
        });

        // TODO: あとでクラス化
        this.applicationDataChannel = this.peerConnection.createDataChannel("application", {
            id: 0, negotiated: true
        });
        this.applicationDataChannel.onmessage = (event) => {
            console.log(event.data);
        }

        this.targetClientId = targetClientId;
        this.signalingManager = new SignalingManager(this.peerConnection, iceMode);
        this.sendMediaChannels = new Map<string, SendMediaChannel>();
        this.receiveMediaChannels = new Map<string, ReceiveMediaChannel>();
        this.sendDataChannels = new Map<string, SendDataChannel>();
        this.receiveDataChannels = new Map<string, ReceiveDataChannel>();

        // イベントハンドラ
        this.onNewReceiveMediaChannel = () => {
        };
        this.onNewReceiveDataChannel = () => {
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
        // すでに存在していたら何もしない
        if (this.sendMediaChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
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
        // すでに存在していたら何もしない
        if (this.receiveMediaChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.receiveMediaChannels.delete(label);
    }

    // SendDataChannelを追加する
    public addSendDataChannel(label: string, sendDataChannel: SendDataChannel) {
        // すでに存在していたら何もしない
        if (this.sendDataChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.sendDataChannels.set(label, sendDataChannel);

    }

    // SendDataChannelを取得する
    public getSendDataChannel(label: string) {
        return this.sendDataChannels.get(label);
    }

    // SendDataChannelを削除する
    public removeDataMediaChannel(label: string) {
        // すでに存在していたら何もしない
        if (this.sendDataChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.sendDataChannels.delete(label);
    }

    // ReceiveDataChannelを追加する
    private addReceiveDataChannel(label: string, receiveDataChannel: ReceiveDataChannel) {
        // すでに存在していたら何もしない
        if (this.receiveDataChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.receiveDataChannels.set(label, receiveDataChannel);
    }

    // ReceiveDataChannelを取得する
    public getReceivedDataChannel(label: string) {
        return this.receiveDataChannels.get(label);
    }

    // ReceiveDataChannelを削除する
    private removeReceiveDataChannel(label: string) {
        // すでに存在していたら何もしない
        if (this.receiveDataChannels.has(label)) {
            console.error(`${label}はすでに存在します。`);
            return;
        }

        this.receiveDataChannels.delete(label);
    }

    // テスト用DataChannel送信
    // TODO: 消す
    public sendApplicationDataChannel(message: string) {
        if (!this.applicationDataChannel) {
            return;
        }

        this.applicationDataChannel.send(message);
    }
}
