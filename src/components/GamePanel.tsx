import { DialogButton, PanelSection, PanelSectionRow } from "decky-frontend-lib";
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
}

const GamePanel: React.FunctionComponent<GamePanelProps> = (props) => {
  const [hideGamePanel, setHideGamePanel] = React.useState(props.hidden);
  if (hideGamePanel) return null;
  return (
    <PanelSection>
      <PanelSectionRow>
        <DialogButton
          onClick={() => {
            window.open(props.link)
          }}
          onSecondaryButton={async () => {
            let response = await PyCaller.toggleDealVisibility(props.id)
            if (response.success) {
              let is_hidden = Boolean(response.result['hidden'])
              setHideGamePanel(is_hidden)
            }
          }}
          onOKActionDescription='Open Store Page'
          onSecondaryActionDescription={hideGamePanel ? 'Show Game':'Hide Game'}
        >
          <table>
            <tr>
              <td>
                <img src={props.image_url} style={{borderRadius: '10px', height: '160px', marginRight: '10px'}}/>
              </td>
              <td style={{width: '100%'}}>
                <div>
                  <h1 style={{ 
                    lineHeight: props.show_title ? '40px':'0px',
                    visibility: props.show_title ? 'visible':'hidden' }}>{props.title}</h1>
                  <h3 style={{ lineHeight: '10px' }}>{props.platforms}</h3>
                  <h3 style={{ lineHeight: '10px' }}><s>{props.worth}</s> Free</h3>
                  <h3 style={{ lineHeight: '10px' }}>Ends {props.end_date}</h3>
                </div>
              </td>
            </tr>
          </table>
        </DialogButton>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { GamePanel };