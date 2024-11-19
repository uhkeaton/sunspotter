import * as React from "react";
import Button from "@mui/material/Button";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { IconButton } from "@mui/material";

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
        open={open}
        onClose={handleClose}
        scroll={"body"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Sunspotter</DialogTitle>
        <DialogContent dividers={false}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            This is just for fun
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Got it</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
