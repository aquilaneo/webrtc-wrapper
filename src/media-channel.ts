/**
 * ===== 送信MediaChannel =====
 */
export class SendMediaChannel {
    public readonly mediaStream: MediaStream;
    private _enable: boolean;
    public readonly mediaCodecPriority: MediaCodecPriority | undefined;
    public readonly targetMediaBitrate: TargetMediaBitrate | undefined;

    /**
     * コンストラクタ
     * @param mediaStream 割り当てるMediaStream
     * @param enable 最初の有効/無効状態
     * @param options SendMediaChannelのオプション
     */
    public constructor(mediaStream: MediaStream, enable: boolean, options?: SendMediaChannelOption) {
        this.mediaStream = mediaStream;
        this._enable = enable;
        this.mediaCodecPriority = options?.mediaCodecPriority;
        this.targetMediaBitrate = options?.targetMediaBitrate;
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

// ===== SendMediaChannelのオプション =====
interface SendMediaChannelOption {
    mediaCodecPriority?: MediaCodecPriority,
    targetMediaBitrate?: TargetMediaBitrate,
}

/**
 * ===== メディアコーデックの優先順位 =====
 */
interface MediaCodecPriority {
    video?: VideoCodec[],
    audio?: AudioCodec[],
}

/**
 * ===== 動画コーデック =====
 */
export const VideoCodec = {
    H264: "video/H264",
    H265: "video/H265",
    VP8: "video/VP8",
    VP9: "video/VP9",
    AV1: "video/AV1",
} as const;
export type VideoCodec = (typeof VideoCodec)[keyof typeof VideoCodec];

/**
 * ===== 音声コーデック =====
 */
export const AudioCodec = {
    Opus: "audio/opus",
} as const;
export type AudioCodec = (typeof AudioCodec)[keyof typeof AudioCodec];

/**
 * ===== メディアの目標ビットレート[kbps] =====
 */
interface TargetMediaBitrate {
    video?: number,
    audio?: number,
}
