// Изначально идея была в том чтобы сделать двухстороннюю привязку
// то есть - <div id={CHAT_SELECTORS.FORM} />,
// но в таком случае HMR astrojs слишком часто перезагружает страницу(webRTC сбрасывается)
export const CHAT_SELECTORS = {
  FORM: "chatSection",
  MESSAGE_LIST: "message-list",
  MESSAGE_INPUT: "messageInput",
  SEND_BTN: "sendBtn",
};
