// ===== 送信DataChannel =====
export class SendDataChannel {
    private reliability: DataChannelReliability;

    public constructor(reliability: DataChannelReliability) {
        this.reliability = reliability;
    }

    // テキストを送信
    public sendText(message: string) {

    }

    // ArrayBufferを送信
    public sendArrayBuffer(message: ArrayBuffer) {

    }
}

// ===== 受信DataChannel =====
export class ReceiveDataChannel {
    private onTextMessage: (message: string) => void;
    private onArrayBufferMessage: (message: ArrayBuffer) => void;

    public constructor() {
        // イベントハンドラ
        this.onTextMessage = () => {
        };
        this.onArrayBufferMessage = () => {
        };
    }
}

// ===== DataChannelの信頼性設定 =====
export interface DataChannelReliability {
    reliability: boolean
}
