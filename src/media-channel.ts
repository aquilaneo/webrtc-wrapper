/**
 * ===== 送信MediaChannel =====
 */
export class SendMediaChannel {
    public readonly mediaStream: MediaStream;
    private _enable: boolean;

    /**
     * コンストラクタ
     * @param mediaStream 割り当てるMediaStream
     * @param enable 最初の有効/無効状態
     */
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

/**
 * ===== 受信MediaChannel =====
 */
export class ReceiveMediaChannel {
    private mediaStream: MediaStream;
    private onEnableChanged: (enable: boolean) => void;

    /**
     * コンストラクタ
     * @param mediaStream 割り当てるMediaStream
     */
    public constructor(mediaStream: MediaStream) {
        this.mediaStream = mediaStream;

        // イベントハンドラ
        this.onEnableChanged = () => {
        };
    }
}
