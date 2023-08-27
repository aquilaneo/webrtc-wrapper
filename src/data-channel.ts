/**
 * ===== 送信DataChannel =====
 */
export class DataChannel {
    public readonly dataChannel: RTCDataChannel;
    public onTextMessage: (message: string) => void;
    public onArrayBufferMessage: (message: ArrayBuffer) => void;

    /**
     * コンストラクタ
     * @param dataChannel 割り当てるRTCDataChannel
     */
    public constructor(dataChannel: RTCDataChannel) {
        this.dataChannel = dataChannel;

        // イベントハンドラ
        this.onTextMessage = () => {
        };
        this.onArrayBufferMessage = () => {
        };

        this.dataChannel.onmessage = this.onMessageBase.bind(this);
    }

    /**
     * テキストを送信
     * @param message 送信するメッセージ文字列
     */
    public sendText(message: string) {
        this.dataChannel.send(message);
    }

    /**
     * ArrayBufferを送信
     * @param message 送信するメッセージArrayBuffer
     */
    public sendArrayBuffer(message: ArrayBuffer) {
        this.dataChannel.send(message);
    }

    /**
     * メッセージ受信
     * @param event 受信イベント
     */
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

    /**
     * DataChannel開通しているかどうか
     * @return boolean true: 開通, false: 未開通
     */
    public isOpen() {
        return this.dataChannel.readyState === "open";
    }
}
