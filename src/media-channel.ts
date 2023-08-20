// ===== 送信MediaChannel =====
export class SendMediaChannel {
    private mediaStream: MediaStream;
    private _enable: boolean;

    public constructor(mediaStream: MediaStream, enable: boolean) {
        this.mediaStream = mediaStream;
        this._enable = enable;
    }

    public get enable() {
        return this._enable;
    }

    public set enable(enable: boolean) {
        this._enable = enable;
    }
}

// ===== 受信MediaChannel =====
export class ReceiveMediaChannel {
    private mediaStream: MediaStream;
    private onEnableChanged: (enable: boolean) => void;

    public constructor(mediaStream: MediaStream) {
        this.mediaStream = mediaStream;

        // イベントハンドラ
        this.onEnableChanged = () => {
        };
    }
}
