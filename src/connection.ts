import { ReceiveMediaChannel, SendMediaChannel } from "./media-channel.ts";
import { ReceiveDataChannel, SendDataChannel } from "./data-channel.ts";

export class Connection {
    private targetClientId: string;
    private sendMediaChannels: Map<string, SendMediaChannel>;
    private receiveMediaChannels: Map<string, ReceiveMediaChannel>;
    private sendDataChannels: Map<string, SendDataChannel>;
    private receiveDataChannels: Map<string, ReceiveDataChannel>;

    private peerConnection: RTCPeerConnection;

    // イベントハンドラ
    public onNewReceiveMediaChannel: (label: string, receiveMediaChannel: ReceiveMediaChannel) => void;
    public onNewReceiveDataChannel: (label: string, receiveDataChannel: ReceiveDataChannel) => void;

    public constructor(targetClientId: string) {
        this.targetClientId = targetClientId;
        this.sendMediaChannels = new Map<string, SendMediaChannel>();
        this.receiveMediaChannels = new Map<string, ReceiveMediaChannel>();
        this.sendDataChannels = new Map<string, SendDataChannel>();
        this.receiveDataChannels = new Map<string, ReceiveDataChannel>();

        this.peerConnection = new RTCPeerConnection();

        // イベントハンドラ
        this.onNewReceiveMediaChannel = () => {
        };
        this.onNewReceiveDataChannel = () => {
        };
    }

    // P2P接続を開始する
    public connect() {

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
}
