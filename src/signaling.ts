import { DataChannel } from "./data-channel.ts";

/**
 * ===== シグナリング関連クラス =====
 */
export class SignalingManager {
    private peerConnection: RTCPeerConnection;
    private readonly signalingDataChannel: DataChannel;
    private readonly iceMode: IceMode;

    /**
     * コンストラクタ
     * @param peerConnection 対応させるRTCPeerConnection
     * @param signalingDataChannel シグナリング用DataChannel
     * @param iceMode シグナリングに VanillaICE と TricleICE のどちらを使うか
     */
    public constructor(peerConnection: RTCPeerConnection, signalingDataChannel: DataChannel, iceMode: IceMode) {
        this.peerConnection = peerConnection;
        this.signalingDataChannel = signalingDataChannel;
        this.signalingDataChannel.onTextMessage = this.handleSignalingMessage.bind(this);
        this.iceMode = iceMode;
    }

    /**
     * 自動再シグナリングを有効化する
     */
    public enableAutoReSignaling() {
        this.peerConnection.onnegotiationneeded = this.executeSignalingAsOffer.bind(this);
    }

    /**
     * offerとしてシグナリングを行う
     * @return { Promise<void> }
     */
    public async executeSignalingAsOffer() {
        const sdp = await this.createOffer();

        if (!this.signalingDataChannel.isOpen()) {
            // シグナリング用DataChannel開通前
        } else {
            // シグナリング用DataChannel開通後
            const signalingMessage: SignalingMessage = {
                offerOrAnswer: SignalingRole.Offer,
                sdp: sdp
            };
            this.signalingDataChannel.sendText(JSON.stringify(signalingMessage));
        }
    }

    /**
     * answerとしてシグナリングを行う
     */
    public executeSignalingAsAnswer() {

    }

    /**
     * offerを用意する
     * @return { Promise<string> } Offer SDP文字列
     * TODO: privateにする
     */
    public async createOffer() {
        return await this.createLocalSessionDescriptionBase(SignalingRole.Offer);
    }

    /**
     * 相手のofferを登録する
     * @param sdp 登録する相手のOffer SDP文字列
     * TODO: privateにする
     */
    public async setRemoteOffer(sdp: string) {
        await this.setRemoteSessionDescriptionBase(sdp, SignalingRole.Offer);
    }

    /**
     * answerを用意する
     * @return {Promise<string>} Answer SDP文字列
     * TODO: privateにする
     */
    public async createAnswer() {
        return await this.createLocalSessionDescriptionBase(SignalingRole.Answer);
    }

    /**
     * 相手のanswerを登録する
     * @param sdp 登録する相手のAnswer SDP文字列
     * TODO: privateにする
     */
    public async setRemoteAnswer(sdp: string) {
        await this.setRemoteSessionDescriptionBase(sdp, SignalingRole.Answer);
    }

    /**
     * 自分のoffer/answer作成の基底
     * @param signalingRole offerかanswerか
     * @return {Promise<string>} SDP文字列
     */
    private async createLocalSessionDescriptionBase(signalingRole: SignalingRole) {
        // offer/answerのlocal descriptionを作成する
        let localSessionDescription;
        if (signalingRole === SignalingRole.Offer) {
            localSessionDescription = await this.peerConnection.createOffer();
        } else {
            localSessionDescription = await this.peerConnection.createAnswer();
        }
        await this.peerConnection.setLocalDescription(localSessionDescription);

        // Vanilla ICEの場合はICE Gatheringの完了を待つ -> ICE Candidate入りのSessionDescriptionを取得
        if (this.iceMode === IceMode.VanillaIce) {
            await this.waitForIceGatheringComplete();
            localSessionDescription = this.peerConnection.localDescription;
            if (!localSessionDescription) {
                console.error("Local Descriptionの取得に失敗しました。");
                return "";
            }
        }

        // SDP文字列を返す
        if (!localSessionDescription.sdp) {
            console.error("Offerの取得に失敗しました。");
            return "";
        }
        return localSessionDescription.sdp;
    }

    /**
     * 相手のoffer/answer登録の基底
     * @param sdp 相手のSDP文字列
     * @param signalingRole offerかanswerか
     */
    private async setRemoteSessionDescriptionBase(sdp: string, signalingRole: SignalingRole) {
        // 渡されたSDP文字列を元にoffer/answerのremote descriptionを作成し登録する
        const remoteSessionDescription = new RTCSessionDescription({
            type: signalingRole === SignalingRole.Offer ? "offer" : "answer",
            sdp: sdp
        });
        await this.peerConnection.setRemoteDescription(remoteSessionDescription);
    }

    /**
     * ICE Gatheringの完了を待つ
     */
    private async waitForIceGatheringComplete() {
        return new Promise<void>((resolve) => {
            // 接続完了していたら即終了
            if (this.peerConnection.iceConnectionState === "connected"
                || this.peerConnection.iceConnectionState === "completed") {
                resolve();
            }

            // ICE完了待ち
            this.peerConnection.onicecandidate = (event) => {
                // Gatheringが完了するとcandidateがnullになる
                if (event.candidate === null) {
                    resolve();
                }
            };
        });
    }

    /**
     * シグナリングメッセージの受信
     * @return { Promise<void> }
     */
    private async handleSignalingMessage(message: string) {
        const parsed = JSON.parse(message) as SignalingMessage;
        if (parsed.offerOrAnswer === SignalingRole.Offer) {
            // Offerからのメッセージ
            await this.setRemoteOffer(parsed.sdp);
        } else {
            // Answerからのメッセージ
            await this.setRemoteAnswer(parsed.sdp);
        }
    }
}

/**
 * ===== ICE処理のモード =====
 */
export const IceMode = {
    VanillaIce: 0,
    TrickleIce: 1
} as const;
export type IceMode = (typeof IceMode)[keyof typeof IceMode];

// ===== シグナリングのロール =====
export const SignalingRole = {
    Offer: 0,
    Answer: 1,
} as const;
export type SignalingRole = (typeof SignalingRole)[keyof typeof SignalingRole];

/**
 * ===== シグナリング用メッセージインターフェース =====
 */
interface SignalingMessage {
    offerOrAnswer: SignalingRole,
    sdp: string
}
