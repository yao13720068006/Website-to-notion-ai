/*
 * @Author: Mr_Yaoo 2316718372@qq.com
 * @Date: 2023-05-24 17:26:42
 * @LastEditors: Mr_Yaoo 2316718372@qq.com
 * @LastEditTime: 2023-05-24 18:05:06
 * @FilePath: \node_asset\router\chat.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const axios = require('axios');

module.exports = async (req, res) => {
  // 从POST请求中获取用户的输入文本
  const messages = req.body.messages;

  const params = {
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
    temperature: 1,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    messages: messages,
    stream: false,
  };
  const api_key = process.env.GPTKEY;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${api_key}`,
    Accept: "application/json",
  };
  const url = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await axios.post(url, params, { headers });
    let reply = response.data.choices[0].message.content;
    res.json(reply);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "An error occurred" });
  }

  // 发送回复到前端
//   res.send({ reply });
};
