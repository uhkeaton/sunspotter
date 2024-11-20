import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { IconButton } from "@mui/material";

const IMG_0676 = "/~georgekw/SUNSPOTTER/IMG_0676.jpeg";
const IMG_0677 = "/~georgekw/SUNSPOTTER/IMG_0677.jpeg";
const IMG_0678 = "/~georgekw/SUNSPOTTER/IMG_0678.jpeg";
const IMG_0679 = "/~georgekw/SUNSPOTTER/IMG_0679.jpeg";

export default function OpticsDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <React.Fragment>
      <IconButton size="large" onClick={handleClickOpen()}>
        <LightbulbIcon fontSize="large" />
      </IconButton>
      <Dialog
        maxWidth={"sm"}
        fullWidth={true}
        open={open}
        onClose={handleClose}
        scroll={"body"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Sunspotter Diagram</DialogTitle>
        <DialogContent dividers={false}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <img style={{ width: "100%", marginBottom: 16 }} src={IMG_0676} />
            <img style={{ width: "100%", marginBottom: 16 }} src={IMG_0677} />
            <img style={{ width: "100%", marginBottom: 16 }} src={IMG_0678} />
            <img style={{ width: "100%", marginBottom: 16 }} src={IMG_0679} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Got it</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
