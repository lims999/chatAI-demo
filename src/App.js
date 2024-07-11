import {
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Input,
  InputAdornment,
  IconButton,
  OutlinedInput,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";

import "./App.css";
import { useState } from "react";

function App() {
  const [inputApiKey, setInputApiKey] = useState(""); // 输入的 api key
  const [apiKey, setApiKey] = useState(""); // 保存的 api key
  const [sendValue, setSendValue] = useState(""); // 发送的内容
  const [chatList, setChatList] = useState([]); // 聊天记录
  const [loading, setLoading] = useState(false); // 是否正在加载
  const [open, setOpen] = useState(false); // 是否显示输入框

  // 确认输入 key
  const handleConfirm = () => {
    setApiKey(inputApiKey);
    setOpen(false);
  };
  // 发送消息
  const handleClickSend = () => {
    if (!sendValue || loading) {
      return;
    }
    setLoading(true);
    const sendMessage = {
      role: "user",
      content: sendValue,
    };
    setChatList((prev) => {
      return [...prev, sendMessage];
    });
    setSendValue("");
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        // 未输入 key 时使用免费模型
        Authorization: `Bearer ${
          apiKey ||
          "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"
        }`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 判断是否有 key 选择模型
        model: apiKey
          ? "openai/gpt-3.5-turbo-1106"
          : "mistralai/mistral-7b-instruct:free ",
        messages: [...chatList, sendMessage],
      }),
    })
      .then((res) => {
        return res.json(); // 不是用户需要的数据，通过return返回给浏览器
      })
      .then((data) => {
        // 服务器返回给客户端的数据
        const { choices, error } = data;
        if (error) {
          console.log("请求有误，请检查key是否可用", error);
        }
        const { message } = choices[0];
        setChatList((prev) => {
          return [...prev, message];
        });
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="App">
      <div className="content">
        <Button
          variant="contained"
          sx={{ position: "fixed", left: "30px", top: "10px" }}
          onClick={() => setOpen(true)}
        >
          输入 key
        </Button>
        <List sx={{ width: "100%", maxWidth: "768px", marginTop: "50px" }}>
          {chatList.map((item, index) => {
            return (
              <ListItem
                sx={{ padding: "8px 0" }}
                alignItems="flex-start"
                key={index}
              >
                <Avatar
                  sx={{
                    width: "24px",
                    height: "24px",
                    margin: "12px 12px 0 0",
                  }}
                  alt={item.role}
                  src="/xxx"
                />
                <ListItemText
                  primary={item.role}
                  primaryTypographyProps={{
                    color: "#0d0d0d",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                  secondary={item.content}
                  secondaryTypographyProps={{
                    color: "#0d0d0d",
                    fontSize: "16px",
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </div>

      <div className="inputField">
        <OutlinedInput
          id="xxx"
          type="text"
          placeholder="给“ChatAI”发送消息"
          fullWidth
          sx={{ maxWidth: 768 }}
          multiline
          maxRows={9}
          value={sendValue}
          onChange={(e) => setSendValue(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                edge="end"
                onClick={handleClickSend}
              >
                {<Visibility />}
              </IconButton>
            </InputAdornment>
          }
        />
      </div>

      {/* 提示输入key */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle id="alert-dialog-title">
          输入 API_KEY 以使用付费模型
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            借助付费模型，您可以获取更加智能的回复和准确的结果。
            <Input
              fullWidth
              onChange={(e) => setInputApiKey(e.target.value)}
            ></Input>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleConfirm} autoFocus>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
