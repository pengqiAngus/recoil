import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { atom, useRecoilValue, useRecoilState, useSelector } from "./recoil";
const textState = atom<string>({
  key: "textState",
  default: "测试",
});

const charCount = useSelector({
  key: "textState",
  get: ({ get }) => {
    const text = get(textState);
    return text.length;
  },
});
function App() {
  const count = useRecoilValue(charCount);
  const [number, setNumber] = useState<number>(0);
  const [text, setText] = useRecoilState<string>(textState);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button className="btn" onClick={() => setNumber(number + 1)}>
          {number}
        </button>
        {count}
        <input key={number} type="text" value={text} onChange={onChange} />
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
