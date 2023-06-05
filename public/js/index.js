// 显示成功提示
// toastr.success('操作成功！', '成功');

// 显示错误提示
// toastr.error('操作失败，请重试！', '错误');

// 显示警告提示
// toastr.warning('注意，该操作可能导致数据丢失！', '警告');

// 显示信息提示
// toastr.info('欢迎访问我们的网站！', '信息');

// notion弹框打开事件
$("#myModal").on("shown.bs.modal", function () {
  var form = document.getElementById("notionFormId");
  var loadingAnimation = document.getElementById("loadingAnimation");
  var loadingAnimation = document.getElementById("loadingAnimation");
  var successMessage = document.getElementById("successMessage");
  var errorMessage = document.getElementById("errorMessage");
  var saveSubNotion = document.getElementById("saveSubNotion");

  form.style.display='block';
  saveSubNotion.style.display='block';
  loadingAnimation.style.display='none';
  successMessage.style.display='none';
  errorMessage.style.display='none';
  toggleButton('saveSubNotion',false);
  // 在弹框打开时触发的事件回调函数
  // 执行 Ajax 请求来获取数据
  $.ajax({
    url: "/notion-list",
    method: "GET",
    success: function (response) {
      // 处理请求成功后的响应数据
      // 更新弹框内容
      var selectElement = document.getElementById("insert-input");

      for (var i = 0; i < response.length; i++) {
        var option = document.createElement("option");
        option.value = response[i].id;

        var title = response[i].child_page.title;
        if (title.length > 50) {
          title = title.substring(0, 47) + "...";
        }

        option.textContent = title;
        selectElement.appendChild(option);
      }
    },
    error: function (xhr, status, error) {
      // 处理请求错误
      toastr.error('Notion笔记列表请求失败，请重试！', '错误');
    },
  });
});

// 保存notion数据
function saveFormData() {
  var form = document.getElementById("notionFormId");
  var loadingAnimation = document.getElementById("loadingAnimation");
  var activeTabId = $(".nav-link.active").attr("id");
  var formData = "";
  if (activeTabId === "new-tab") {
    formData = $("#new-input").val();
    if(formData==''){
      return toastr.warning('注意，该笔记名称为必填字段！', '警告');
    }
    submitNotion(formData);
  } else if (activeTabId === "insert-tab") {
    formData = $("#insert-input").val();
    if(formData==''){
      return toastr.warning('注意，你必须选择一个子页面！', '警告');
    }
    InsertNotion(formData)
  }

  // 显示 GIF 动画
  loadingAnimation.style.display = "block";
  form.style.display = "none";
  toggleButton('saveSubNotion',true);

  // 在这里处理表单数据，比如保存到 Notion 或其他操作
  // console.log("当前选项卡：", activeTabId);
  // console.log("表单数据：", formData);

  // 关闭弹框
  // $("#myModal").modal("hide");
}

// 打开或关闭loading
function toggleLoadingWithOverlay(nodeId, isLoading) {
  var node = document.getElementById(nodeId);

  if (isLoading) {
    // 添加绝对定位
    node.style.position = "relative";
    // 创建蒙版元素
    var overlay = document.createElement("div");
    overlay.classList.add("loading-overlay");

    // 创建加载效果元素
    var loadingSpinner = document.createElement("div");
    loadingSpinner.classList.add("loading-spinner");

    // 将加载效果元素添加到蒙版中
    overlay.appendChild(loadingSpinner);

    // 添加蒙版到指定元素
    node.appendChild(overlay);
  } else {
    // 移除蒙版
    var overlay = node.querySelector(".loading-overlay");
    if (overlay) {
      node.removeChild(overlay);
    }
  }
}

// 给指定的button按钮禁用或开启
function toggleButton(nodeId, isLoading) {
  var button = document.getElementById(nodeId);

  if (isLoading) {
    // 禁用按钮防止多次点击
    button.disabled = true;
  } else {
    // 移除旋转效果
    // 启用按钮
    button.disabled = false;
  }
}

// 节点字数查询
function countCharacters() {
  var textarea = document.getElementById("result");
  var charCountElement = document.getElementById("charCount");
  var charCount = textarea.value.length;
  charCountElement.textContent = charCount;
}
document.getElementById("urlForm").addEventListener("submit", (event) => {
  event.preventDefault(); // 阻止表单默认提交行为
  toggleButton("requestId", true);
  toggleLoadingWithOverlay("leftMain", true);

  var url = document.getElementById("url").value;

  fetch("/process-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "url=" + encodeURIComponent(url),
  })
    .then((response) => response.text())
    .then((result) => {
      document.getElementById("result").value = result;
      toggleButton("requestId", false);
      toggleLoadingWithOverlay("leftMain", false);
      countCharacters();
      // submitMessage()
    })
    .catch((error) => {
      toastr.error('请求失败，请重试！', '错误');
      toggleButton("requestId", false);
      toggleLoadingWithOverlay("leftMain", false);
      console.error("An error occurred:", error);
      document.getElementById("result").value = "An error occurred";
    });
});

// 大文本数据分割
function splitTextIntoSegments(text, maxTokensPerSegment) {
  const words = text.split(" ");
  const segments = [];
  let currentSegment = "";

  for (const word of words) {
    const segmentWithWord = currentSegment + " " + word;

    if (segmentWithWord.length <= maxTokensPerSegment) {
      currentSegment = segmentWithWord;
    } else {
      segments.push(currentSegment.trim());
      currentSegment = word;
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment.trim());
  }

  return segments;
}

// 截取到合理的字符

function truncateMessage(userMessage) {
  const maxCharacters = 2000;
  if (userMessage.length <= maxCharacters) {
    return userMessage;
  } else {
    return userMessage.slice(0, maxCharacters);
  }
}

// 转译为md
function convertDataToMarkdownTable(data) {
  const rows = data.split("\n");
  const header = rows[0].split("|").map((item) => item.trim());
  const separator = rows[1].split("|").map((item) => item.trim());
  const contentRows = rows
    .slice(2, rows.length - 1)
    .map((row) => row.split("|").map((item) => item.trim()));

  const table = [];
  table.push(header);
  table.push(separator);

  for (const contentRow of contentRows) {
    table.push(contentRow);
  }

  const markdownTable = table
    .map((row) => "|" + row.join("|") + "|")
    .join("\n");
  return markdownTable;
}

// 发送消息
function submitMessage() {
  // 获取DOM元素
  const result = document.getElementById("result");
  const GPTtext = document.getElementById("GPTtext");
  const aiText = document.getElementById("aiText");
  // 获取用户输入
  const userMessage = result.value;

  // 将用户消息添加到聊天界面
  // output.innerHTML += `<p><strong>用户:</strong> ${userMessage}</p>`;

  // const MAX_TOKENS_PER_MESSAGE = 100; // 每个消息的最大令牌数量

  // 将 userMessage 分割为多个消息
  // const userMessageSegments = splitTextIntoSegments(userMessage, MAX_TOKENS_PER_MESSAGE);

  // 构建消息数组
  const messages = [
    {
      role: "system",
      content: `${aiText.value}:${truncateMessage(userMessage)}`,
    },
  ];

  // 发送 API 请求
  toggleButton("analysisId", true);
  toggleLoadingWithOverlay("rightMain", true);
  axios
    .post("/chat-url", {messages})
    .then((response) => {
      console.log(response);
      // 将OpenAI API的响应添加到聊天界面
      GPTtext.value += response.data;
      toggleButton("analysisId", false);
      toggleLoadingWithOverlay("rightMain", false);
    })
    .catch((error) => {
      toastr.error('请求失败，请重试！', '错误');
      toggleButton("analysisId", false);
      toggleLoadingWithOverlay("rightMain", false);
    });

  // GPTtext.innerHTML += marked(convertedHtml);

  // 清空输入框
  // input.value = '';
}

// 保存到notion
async function submitNotion(title) {
  var loadingAnimation = document.getElementById("loadingAnimation");
  var successMessage = document.getElementById("successMessage");
  var errorMessage = document.getElementById("errorMessage");
  var saveSubNotion = document.getElementById("saveSubNotion");
  const url = document.getElementById("url");
  const requestData = {
    title,
    text: GPTtext.value,
  };
  // 发送 API 请求
  axios
    .post("/notion-url", requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // 隐藏 GIF 动画，显示保存成功的提示内容
      loadingAnimation.style.display = "none";
      successMessage.style.display = "block";
      saveSubNotion.style.display = "none";
    })
    .catch((err) => {
      toastr.error('请求失败，请重试！', '错误');
      // 隐藏 GIF 动画，显示保存成功的提示内容
      loadingAnimation.style.display = "none";
      errorMessage.style.display = "block";
      saveSubNotion.style.display = "none";
    });
}

// 插入到notion
async function InsertNotion(pid) {
  var loadingAnimation = document.getElementById("loadingAnimation");
  var successMessage = document.getElementById("successMessage");
  var errorMessage = document.getElementById("errorMessage");
  var saveSubNotion = document.getElementById("saveSubNotion");
  const requestData = {
    pid,
    text: GPTtext.value,
  };
  // 发送 API 请求
  axios
    .post("/notion-insert", requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // 隐藏 GIF 动画，显示保存成功的提示内容
      loadingAnimation.style.display = "none";
      successMessage.style.display = "block";
      saveSubNotion.style.display = "none";
    })
    .catch((err) => {
      toastr.error('请求失败，请重试！', '错误');
      // 隐藏 GIF 动画，显示保存成功的提示内容
      loadingAnimation.style.display = "none";
      errorMessage.style.display = "block";
      saveSubNotion.style.display = "none";
    });
}
