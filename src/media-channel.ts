/**
 * ===== 送信MediaChannel =====
 */
export class SendMediaChannel {
    public readonly mediaStream: MediaStream;
    private videoEnabled: boolean;
    private audioEnabled: boolean;
    public readonly mediaCodecPriority: MediaCodecPriority | undefined;
    public readonly targetMediaBitrate: TargetMediaBitrate | undefined;

    /**
     * コンストラクタ
     * @param mediaStream 割り当てるMediaStream
     * @param videoEnabled 最初の動画有効/無効状態
     * @param audioEnabled 最初の音声有効/無効状態
     * @param options SendMediaChannelのオプション
     */
    public constructor(mediaStream: MediaStream, videoEnabled: boolean, audioEnabled: boolean, options?: SendMediaChannelOption) {
        this.mediaStream = mediaStream;
        this.videoEnabled = videoEnabled;
        this.audioEnabled = audioEnabled;
        this.mediaCodecPriority = options?.mediaCodecPriority;
        this.targetMediaBitrate = options?.targetMediaBitrate;
    }

    /**
     * 動画の有効無効状態を切り替える
     * @param enable 有効/無効
     */
    public setVideoEnabled(enable: boolean) {
        this.videoEnabled = enable;
        const videoTracks = this.mediaStream.getVideoTracks();
        this.setTracksEnabled(videoTracks, enable);
    }

    /**
     * 動画の有効無効状態を取得する
     */
    public getVideoEnabled() {
        return this.videoEnabled;
    }

    /**
     * 音声の有効無効状態を切り替える
     * @param enable 有効/無効
     */
    public setAudioEnabled(enable: boolean) {
        this.audioEnabled = enable;
        const audioTracks = this.mediaStream.getAudioTracks();
        this.setTracksEnabled(audioTracks, enable);
    }

    /**
     * 音声の有効無効状態を取得する
     */
    public getAudioEnabled() {
        return this.audioEnabled;
    }

    /**
     * MediaStreamTrackの配列全てにenableを適用する
     * @param tracks MediaStreamTrackの配列
     * @param enable 有効/無効
     */
    private setTracksEnabled(tracks: MediaStreamTrack[], enable: boolean) {
        for (const track of tracks) {
            track.enabled = enable;
        }
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
