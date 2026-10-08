# 하치와레랑 이야기하기 — GitHub Pages 버전

이 버전은 **GitHub Pages에 바로 올릴 수 있도록 정적 웹앱**으로 구성했습니다.

## 중요한 점
GitHub Pages는 HTML/CSS/JavaScript 같은 정적 파일을 호스팅하는 서비스입니다.
따라서 OpenAI API 같은 비밀 API 키를 브라우저에 넣어서 배포하면 안 됩니다.

그래서 기본 상태는:
- 하치와레 화면
- 채팅 UI
- 음성 입력
- 하치와레 음성 출력
- 간단한 데모 대화

가 바로 작동합니다.

### 실제 AI 대화를 연결하려면
GitHub Pages 자체에서 서버를 실행할 수 없으므로 **별도의 HTTPS 백엔드**가 하나 필요합니다.

백엔드는 다음 형태의 요청을 받아야 합니다.

POST `/api/chat`

```json
{
  "messages": [
    {"role":"user","content":"오늘 너무 힘들어"},
    {"role":"assistant","content":"에엣… 무슨 일이 있었어?"},
    {"role":"user","content":"학교에서 친구랑 싸웠어"}
  ]
}
```

응답:

```json
{
  "reply": "에엣… 친구랑 싸웠구나. 괜찮아? 무슨 일이 있었는지 말해줘도 돼."
}
```

그 다음 `app.js`의:

```js
const AI_ENDPOINT = "";
```

를 실제 HTTPS 주소로 바꾸면 됩니다.

**API 키는 절대로 `app.js`, `index.html`, GitHub 저장소에 넣지 마세요.**
API 키는 백엔드 서버의 환경변수에서 관리해야 합니다.

## GitHub에 올리기

1. GitHub에서 새 repository를 만듭니다.
2. 이 폴더 안의 파일을 repository의 최상위에 올립니다.
3. `.github/workflows/pages.yml`도 같이 올라가야 합니다.
4. GitHub → Settings → Pages에서 GitHub Actions 방식으로 배포합니다.
5. Actions 탭에서 `Deploy to GitHub Pages`가 성공하면 Pages URL에서 사이트를 확인합니다.

GitHub Pages의 프로젝트 사이트 주소는 보통:

`https://깃허브아이디.github.io/저장소이름/`

형태입니다.

## 파일
- `index.html`
- `style.css`
- `app.js`
- `hachiware.png`
- `.nojekyll`
- `.github/workflows/pages.yml`

## 캐릭터 관련
사용자가 제공한 하치와레 이미지를 웹앱에 사용했습니다.
