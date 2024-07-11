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
import SendIcon from "@mui/icons-material/Send";
import {
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import "./App.css";

const DEFAULT_API_KEY =
  "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";

function App() {
  const [inputApiKey, setInputApiKey] = useState(""); // 输入的 api key
  const [apiKey, setApiKey] = useState(""); // 保存的 api key
  const [sendValue, setSendValue] = useState(""); // 发送的内容
  const [chatList, setChatList] = useState([]); // 聊天记录
  const [loading, setLoading] = useState(false); // 是否正在加载
  const [open, setOpen] = useState(false); // 是否显示输入框
  const [error, setError] = useState(null); // 错误状态

  // 确认输入 key
  const handleConfirm = useCallback(() => {
    setApiKey(inputApiKey);
    setOpen(false);
  }, [inputApiKey]);
  // 模拟流式输出消息内容
  const handleStreamOutput = useCallback((message) => {
    let index = 0;
    const content = message.content;
    const role = "assistant";
    const interval = setInterval(() => {
      if (index < content.length) {
        const currentContent = content.substring(0, index + 1);
        setChatList((prev) => {
          const newList = [...prev];
          if (
            newList.length === 0 ||
            newList[newList.length - 1].role !== role
          ) {
            newList.push({
              role,
              content: currentContent,
            });
          } else {
            newList[newList.length - 1].content = currentContent;
          }
          return newList;
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);
  }, []);
  // 发送消息
  const handleClickSend = useCallback(() => {
    if (!sendValue || loading) {
      return;
    }
    setLoading(true);
    setError(null); // Reset error state
    const sendMessage = {
      role: "user",
      content: sendValue,
    };
    setChatList((prev) => [...prev, sendMessage]);
    setSendValue("");
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey || DEFAULT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: apiKey
          ? "openai/gpt-3.5-turbo-1106"
          : "mistralai/mistral-7b-instruct:free",
        messages: [...chatList, sendMessage],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const { choices, error } = data;
        if (error) {
          console.error("请求有误，请检查key是否可用", error);
          setError("请求有误，请检查key是否可用");
          return;
        }
        const { message } = choices[0];
        handleStreamOutput(message); // 流式输出消息内容
      })
      .catch((e) => {
        console.error(e);
        setError("请求失败，请稍后再试");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sendValue, loading, apiKey, chatList, handleStreamOutput]);

  return (
    <div className="App">
      <Header onOpen={() => setOpen(true)} />
      {error && <div className="error">{error}</div>}
      <div className="chatContainer">
        <ChatList chatList={chatList} />
      </div>
      <InputField
        sendValue={sendValue}
        onChange={(e) => setSendValue(e.target.value)}
        onSend={handleClickSend}
        loading={loading}
      />
      <ApiKeyDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        onChange={(e) => setInputApiKey(e.target.value)}
      />
    </div>
  );
}

const Header = ({ onOpen }) => (
  <header className="header">
    <Button variant="contained" onClick={onOpen}>
      输入 key
    </Button>
  </header>
);

const ChatList = ({ chatList }) => {
  const endOfChatRef = useRef(null);

  useLayoutEffect(() => {
    if (endOfChatRef.current) {
      endOfChatRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatList]);
  return (
    <List className="chatList">
      {chatList.map((item, index) => (
        <ListItem className="chatItem" key={index}>
          <Avatar
            className="avatar"
            alt={item.role}
            src={item.role === "user" ? "/user-avatar.png" : "/ai-avatar.png"} // 更改头像
          />
          <ListItemText
            primary={item.role === "user" ? "用户" : "助手"}
            primaryTypographyProps={{
              color: "#0d0d0d",
              fontSize: "16px",
              fontWeight: 600,
            }}
            secondary={item.content}
            secondaryTypographyProps={{
              color: "#0d0d0d",
              fontSize: "16px",
              whiteSpace: "pre-wrap", // 保持换行格式
            }}
          />
        </ListItem>
      ))}
        <div ref={endOfChatRef} />
    </List>
  );
};

const InputField = ({ sendValue, onChange, onSend, loading }) => (
  <footer className="footer">
    <OutlinedInput
      type="text"
      placeholder="给“ChatAI”发送消息"
      fullWidth
      multiline
      maxRows={3}
      value={sendValue}
      onChange={onChange}
      endAdornment={
        <InputAdornment position="end">
          <IconButton edge="end" onClick={onSend} disabled={loading}>
            <SendIcon />
          </IconButton>
        </InputAdornment>
      }
    />
  </footer>
);

const ApiKeyDialog = ({ open, onClose, onConfirm, onChange }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle id="alert-dialog-title">
      输入 API_KEY 以使用付费模型
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        借助付费模型，您可以获取更加智能的回复和准确的结果。请前往
        <a
          href="https://openrouter.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          openrouter.ai
        </a>
        注册并获取您的API key。
        <Input fullWidth onChange={onChange} />
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>取消</Button>
      <Button variant="contained" onClick={onConfirm} autoFocus>
        确认
      </Button>
    </DialogActions>
  </Dialog>
);

export default App;
