import { DialogButton, PanelSectionRow } from "decky-frontend-lib";
import { PyCaller } from "../PyCaller";
import React from "react";

type GamePanelProps = {
  id: string,
  title: string;
  worth: string;
  image_url: string;
  link: string;
  end_date: string;
  platforms: string;
  show_title: boolean;
  hidden: boolean;
  show_hidden_game: boolean;
}

const GamePanel: React.FunctionComponent<GamePanelProps> = (props) => {
  const [hiddenState, setHiddenState] = React.useState(props.hidden);
  const [hideGamePanel, setHideGamePanel] = React.useState(!props.show_hidden_game && props.hidden);
  if (hideGamePanel) return null;
  return (
    <PanelSectionRow>
      <DialogButton
        onClick={() => {
          window.open(props.link)
        }}
        onSecondaryButton={async () => {
          let response = await PyCaller.toggleDealVisibility(props.id)
          if (response.success) {
            let hidden_state = Boolean(response.result['hidden'])
            setHiddenState(hidden_state)
            setHideGamePanel(!props.show_hidden_game && hidden_state)
          }
        }}
        onOKActionDescription='Open Store Page'
        onSecondaryActionDescription={hiddenState ? 'Show Game' : 'Hide Game'}
      >
        <table>
          <tr>
            <td>
              <img src={props.image_url} style={{ borderRadius: '10px', height: '160px', marginRight: '10px' }} />
            </td>
            <td style={{ width: '100%' }}>
              <div>
                <h1 style={{
                  lineHeight: props.show_title ? '40px' : '0px',
                  visibility: props.show_title ? 'visible' : 'hidden'
                }}>{props.title}</h1>
                <h3 style={{ lineHeight: '10px' }}>{props.platforms}</h3>
                <h3 style={{ lineHeight: '10px' }}><s>{props.worth}</s> Free</h3>
                <h3 style={{ lineHeight: '10px' }}>Ends {props.end_date}</h3>
                <h3 style={{
                  lineHeight: hiddenState ? '10px' : '0px',
                  visibility: hiddenState ? 'visible' : 'hidden'
                }}><i>Hidden</i></h3>
              </div>
            </td>
          </tr>
        </table>
      </DialogButton>
    </PanelSectionRow>
  );
}

export { GamePanel };