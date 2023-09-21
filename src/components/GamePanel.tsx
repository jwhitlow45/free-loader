import { DialogButton, PanelSection, PanelSectionRow } from "decky-frontend-lib";

type GamePanelProps = {
  title: string;
  worth: string;
  image_url: string;
  link: string;
  end_date: string;
  platforms: string;
}

const GamePanel: React.FunctionComponent<GamePanelProps> = (props) => {
  return (
    <PanelSection>
      <PanelSectionRow>
        <DialogButton onClick={() => {
          window.open(props.link)
        }}
          onOKActionDescription='Open Store Page'
        >
          <table>
            <tr>
              <td>
                <img src={props.image_url} style={{borderRadius: '10px', height: '160px', marginRight: '10px'}}/>
              </td>
              <td style={{width: '100%'}}>
                <div>
                  <h1 style={{ lineHeight: '40px' }}>{props.title}</h1>
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