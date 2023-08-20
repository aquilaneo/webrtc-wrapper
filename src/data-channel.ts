// ===== 送信DataChannel =====
export class DataChannel {
    private dataChannel: RTCDataChannel;
    public onTextMessage: (message: string) => void;
    public onArrayBufferMessage: (message: ArrayBuffer) => void;

    public constructor(dataChannel: RTCDataChannel) {
        this.dataChannel = dataChannel;

        // イベントハンドラ
        this.onTextMessage = () => {
        };
        this.onArrayBufferMessage = () => {
        };

        this.dataChannel.onmessage = this.onMessageBase.bind(this);
    }

    // テキストを送信
    public sendText(message: string) {
        this.dataChannel.send(message);
    }

    // ArrayBufferを送信
    public sendArrayBuffer(message: ArrayBuffer) {
        this.dataChannel.send(message);
    }

    // メッセージ受信
    private onMessageBase(event: MessageEvent) {
        // stringのメッセージ
        if (typeof (event.data) === "string") {
            this.onTextMessage(event.data);
            return;
        }
        // ArrayBufferのメッセージ
        if (event.data instanceof ArrayBuffer) {
            this.onArrayBufferMessage(event.data);
            return;
        }

        // 不明な型
        console.error("不明なデータ形式を受信しました。");
    }
}
