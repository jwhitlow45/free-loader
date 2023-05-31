import { DialogButton, Router } from "decky-frontend-lib";

const FreeGamesPage: React.FunctionComponent = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToLibraryTab()}>
        Go to Library
      </DialogButton>
    </div>
  );
}

export { FreeGamesPage };