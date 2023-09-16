import { DialogButton, PanelSection, PanelSectionRow } from "decky-frontend-lib";

type GamePanelProps = {
  title: string;
  worth: string;
  image_url: string;
  link: string;
  end_date: string;
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
                <img src={props.image_url} style={{borderRadius: '10px', height: '120px'}}/>
              </td>
              <td style={{width: '100%'}}>
                <div>
                  <h1 style={{ lineHeight: '40px' }}>{props.title}</h1>
                  <h3><s>{props.worth}</s> Free</h3>
                  <h3>Ends {props.end_date}</h3>
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