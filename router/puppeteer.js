/*
 * @Author: Mr_Yaoo 2316718372@qq.com
 * @Date: 2023-05-22 15:57:04
 * @LastEditors: Mr_Yaoo 2316718372@qq.com
 * @LastEditTime: 2023-05-24 14:54:01
 * @FilePath: \node_asset\router\puppeteer.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const puppeteer = require("puppeteer");

module.exports=async (req, res) => {
  const url = req.body.url;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.goto(url);

    const result = await page.evaluate(async () => {
      // 获取所有文本节点
      const textNodes = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );
      let node;
      // 判断一个节点是否位于代码块中
      function isInsideCodeBlock(node) {
        const codeBlockTags = ["PRE", "CODE"];
        const ignoredTags = ["SCRIPT", "STYLE"];

        const ignoredFunctions = [
          "console.log",
          "alert",
          "debugger",
          "window.__NUXT__",
          // 添加其他需要忽略的函数名称
        ];

        let currentNode = node.parentNode;
        while (currentNode) {
          const nodeName = currentNode.nodeName.toUpperCase();

          if (codeBlockTags.includes(nodeName)) {
            return true;
          }

          if (ignoredTags.includes(nodeName)) {
            return false;
          }

          if (currentNode.nodeType === Node.TEXT_NODE) {
            const textContent = currentNode.textContent.toLowerCase();
            if (ignoredFunctions.some((func) => textContent.includes(func))) {
              return false;
            }
          }

          currentNode = currentNode.parentNode;
        }

        return false;
      }

      function compressText(text) {
        // 将连续的空格和换行符替换为一个空格
        const compressedText = text.replace(/\s+/g, " ");

        return compressedText;
      }

      while ((node = walker.nextNode())) {
        // 过滤掉代码块节点
        if (!isInsideCodeBlock(node)) {
          textNodes.push(node);
        }
      }

      // 提取文本内容
      const textContent = textNodes.map((node) => node.textContent).join(" ");
      // let GPTtext = await GPT(
      //   `请将下面的数据整理成表格,联系电话，邮箱等数据：` +
      //     compressText(textContent)
      // );

      return compressText(textContent);
    });

    console.log("Result:", result);

    await browser.close();

    res.send(result);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred");
  }
};
