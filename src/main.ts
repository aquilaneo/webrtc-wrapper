import { Connection } from "./connection.ts";
import { IceMode } from "./signaling.ts";
import { SendMediaChannel } from "./media-channel.ts";

function initialize() {
    const connection = new Connection("", IceMode.VanillaIce);
    let sdp = "";

    // Offerとして接続ボタン
    const connectOfferButton = document.getElementById("connect-offer-button");
    if (connectOfferButton) {
        connectOfferButton.onclick = async () => {
            const offerSdp = await connection.connectAsOffer();
            try {
                await navigator.clipboard.writeText(offerSdp);
                console.log("offer sdp copied")
            } catch {
                // Safariはawaitの後のクリップボード書き込みはユーザーインタラクション起因じゃないと判定されエラーになるため別処理
                sdp = offerSdp;
            }
        };
    }

    // Answerとして接続ボタン
    const connectAnswerButton = document.getElementById("connect-answer-button");
    if (connectAnswerButton) {
        connectAnswerButton.onclick = async () => {
            const offerSdp = await navigator.clipboard.readText();
            const answerSdp = await connection.connectAsAnswer(offerSdp);
            try {
                await navigator.clipboard.writeText(answerSdp);
                console.log("answer sdp copied");
            } catch {
                // Safariはawaitの後のクリップボード書き込みはユーザーインタラクション起因じゃないと判定されエラーになるため別処理
                sdp = answerSdp;
            }
        };
    }

    // Answerを登録ボタン
    const setAnswerButton = document.getElementById("set-remote-answer-button");
    if (setAnswerButton) {
        setAnswerButton.onclick = async () => {
            const answerSdp = await navigator.clipboard.readText();
            await connection.setRemoteAnswer(answerSdp);
        };
    }

    // SDPコピーボタン(Safari用)
    const copySdpButton = document.getElementById("copy-sdp-button");
    if (copySdpButton) {
        copySdpButton.onclick = async () => {
            await navigator.clipboard.writeText(sdp);
        };
    }

    // SDP貼り付けボタン(Safari用)
    const pasteSdpButton = document.getElementById("paste-sdp-button");
    if (pasteSdpButton) {
        pasteSdpButton.onclick = async () => {
            sdp = await navigator.clipboard.readText();
        };
    }

    // カメラ有効化ボタン
    const enableCameraButton = document.getElementById("enable-camera-button");
    if (enableCameraButton) {
        enableCameraButton.onclick = async () => {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1920, height: 1080,
                    facingMode: { exact: "environment" }
                }, audio: true
            });
            const localVideoElem = document.getElementById("local-video") as HTMLVideoElement;
            localVideoElem.srcObject = mediaStream;
            localVideoElem.muted = true;
            localVideoElem.ondurationchange = () => {
                localVideoElem.play();
            };

            const sendMediaChannel = new SendMediaChannel(mediaStream, true);
            connection.addSendMediaChannel("camera", sendMediaChannel);
        };
    }

    // テストメッセージボタン
    const sendTestMessageButton = document.getElementById("send-text-button");
    if (sendTestMessageButton) {
        sendTestMessageButton.onclick = () => {
            connection.sendApplicationDataChannel("Test");
        };
    }

    // 切断処理
    window.onbeforeunload = () => {
        connection.closeConnection();
    };
}

initialize();
