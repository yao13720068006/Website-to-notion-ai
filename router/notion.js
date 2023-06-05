/*
 * @Author: Mr_Yaoo 2316718372@qq.com
 * @Date: 2023-05-23 15:05:33
 * @LastEditors: Mr_Yaoo 2316718372@qq.com
 * @LastEditTime: 2023-05-25 10:26:47
 * @FilePath: \node_asset\router\notion.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { Client } = require("@notionhq/client");
const axios = require('axios');
require("dotenv").config();

const notion = new Client({
  auth: process.env.NOTION_TOKEN, // 替换为你的 Notion API 密钥
});

const parentId = process.env.PARENT_ID; // 替换为你想要创建笔记的父页面 ID

// 创建一个新的页面作为父页面
async function createParentPage(title) {
  try {
    const response = await notion.pages.create({
      parent: {
        page_id: parentId,
      },
      properties: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    });

    const parentPageId = response.id;
    return parentPageId;
  } catch (error) {
    console.error(`Failed to create parent page. Error: ${error}`);
    throw error;
  }
}

// 创建一个新的文本块（Text Block）
async function createTextBlock(parentBlockId, text) {
  try {
    await notion.blocks.children.append({
      block_id: parentBlockId,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: text,
                },
              },
            ],
          },
        },
      ],
    });
  } catch (error) {
    console.error(`Failed to create text block. Error: ${error}`);
    throw error;
  }
}

// 获取所有notion笔记
async function getChildPages(parentId, notionToken) {
  try {
    const response = await axios.get(
      `https://api.notion.com/v1/blocks/${parentId}/children`,
      {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          "Content-Type": "application/json",
          "Notion-Version": "2021-05-13",
        },
      }
    );

    // console.log(response.data.results);

    const results = response.data.results;
    // const childPages = results
    //   .filter((block) => block.type === "page")
    //   .map((page) => {
    //     return {
    //       id: page.id,
    //       title: page.properties.title[0][0].plain_text,
    //     };
    //   });

    return results;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

// 插入文本
async function insertTextToNotionPage(text, pageId) {
  try {
    const response = await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: text,
                },
              },
            ],
          },
        },
      ],
    });

    console.log('文本内容已成功插入到Notion笔记中！');
    return response;
  } catch (error) {
    console.error('出现错误：', error);
    throw error;
  }
}

module.exports = {
  createNotion: async (req, res) => {
    const { title, text } = req.body;

    try {
      const parentPageId = await createParentPage(title);
      await createTextBlock(parentPageId, text);

      res.status(200).json({ message: "Note created successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to create note." });
    }
  },
  notionList: async (req, res) => {
    try {
      const childPages = await getChildPages(parentId, process.env.NOTION_TOKEN);
      res.json(childPages);
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  notionInsert:async (req, res) => {
    try {
      const { text, pid } = req.body;
  
      await insertTextToNotionPage(text, pid);
      
      res.status(200).json({ message: '文本内容已成功插入到Notion笔记中！' });
    } catch (error) {
      console.error('出现错误：', error);
      res.status(500).json({ error: '出现错误' });
    }
  }
};
