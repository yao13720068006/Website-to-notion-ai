/*
 * @Author: Mr_Yaoo 2316718372@qq.com
 * @Date: 2023-05-19 09:54:20
 * @LastEditors: Mr_Yaoo 2316718372@qq.com
 * @LastEditTime: 2023-05-25 10:03:31
 * @FilePath: \node_asset\app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require('express');

const app = express();
app.use(express.json());
const port = 3001;

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.on('error', (err) => {
  console.error('An error occurred:', err);
});

const notion_api=require('./router/notion');

app.post('/process-url', require('./router/puppeteer'));
app.post('/notion-url', notion_api.createNotion);
app.get('/notion-list', notion_api.notionList);
app.post('/notion-insert', notion_api.notionInsert);
app.post('/chat-url', require('./router/chat'));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
