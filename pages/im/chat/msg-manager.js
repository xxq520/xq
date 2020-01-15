import IMOperator from "./im-operator";
import MsgTypeManager from "./msg-type/base/msg-type-manager";

export default class MsgManager extends MsgTypeManager {
    constructor(page) {
        super(page);
    }

    showMsg({msg}) {
        console.log(msg,'showmsg')
        this.getMsgManager({type: msg.type}).showMsg({msg});
    }

    sendMsg({type = IMOperator.TextType, content, duration}) {
        console.log(arguments[0],'sendMsg')
        this.getMsgManager({type}).sendOneMsg(arguments[0]);
    }

    resend({type, content, duration, itemIndex}) {
        console.log(content,'resend')
        this.getMsgManager({type}).resend(arguments[0]);
    }

    stopAllVoice() {
        this.voiceManager.stopAllVoicePlay();
    }
}