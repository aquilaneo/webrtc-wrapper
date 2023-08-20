/**
 * ===== シグナリング関連クラス =====
 */
export class SignalingManager {
    private peerConnection: RTCPeerConnection;
    private readonly iceMode: IceMode;

    /**
     * コンストラクタ
     * @param peerConnection 対応させるRTCPeerConnection
     * @param iceMode シグナリングに VanillaICE と TricleICE のどちらを使うか
     */
    public constructor(peerConnection: RTCPeerConnection, iceMode: IceMode) {
        this.peerConnection = peerConnection;
        this.iceMode = iceMode;
    }

    /**
     * offerとしてシグナリングを行う
     */
    public executeSignalingAsOffer() {

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
        return await this.createLocalSessionDescriptionBase("offer");
    }

    /**
     * 相手のofferを登録する
     * @param sdp 登録する相手のOffer SDP文字列
     * TODO: privateにする
     */
    public async setRemoteOffer(sdp: string) {
        await this.setRemoteSessionDescriptionBase(sdp, "offer");
    }

    /**
     * answerを用意する
     * @return {Promise<string>} Answer SDP文字列
     * TODO: privateにする
     */
    public async createAnswer() {
        return await this.createLocalSessionDescriptionBase("answer");
    }

    /**
     * 相手のanswerを登録する
     * @param sdp 登録する相手のAnswer SDP文字列
     * TODO: privateにする
     */
    public async setRemoteAnswer(sdp: string) {
        await this.setRemoteSessionDescriptionBase(sdp, "answer");
    }

    /**
     * 自分のoffer/answer作成の基底
     * @param type offerかanswerか
     * @return {Promise<string>} SDP文字列
     */
    private async createLocalSessionDescriptionBase(type: "offer" | "answer") {
        // offer/answerのlocal descriptionを作成する
        let localSessionDescription;
        if (type === "offer") {
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
     * @param type offerかanswerか
     */
    private async setRemoteSessionDescriptionBase(sdp: string, type: "offer" | "answer") {
        // 渡されたSDP文字列を元にoffer/answerのremote descriptionを作成し登録する
        const remoteSessionDescription = new RTCSessionDescription({
            type: type,
            sdp: sdp
        });
        await this.peerConnection.setRemoteDescription(remoteSessionDescription);
    }

    /**
     * ICE Gatheringの完了を待つ
     */
    private async waitForIceGatheringComplete() {
        return new Promise<void>((resolve) => {
            this.peerConnection.onicecandidate = (event) => {
                // Gatheringが完了するとcandidateがnullになる
                if (event.candidate === null) {
                    resolve();
                }
            };
        });
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
