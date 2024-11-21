import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import { NOW, useEarth, VERNAL_EQUINOX } from "./useEarth";

const ITEM_HEIGHT = 48;

export function EarthControlsMenu() {
  const { setTimestamp, setLocationCurrent } = useEarth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const options = [
    {
      label: "Time Current",
      action: () => {
        setTimestamp(NOW);
        handleClose();
      },
    },
    {
      label: " Time Vernal Equinox",
      action: () => {
        setTimestamp(VERNAL_EQUINOX);
        handleClose();
      },
    },
    {
      label: "Location Current",
      action: () => {
        handleClose();
        setLocationCurrent();
      },
    },
  ];

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreHoriz />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "20ch",
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.label}
            // selected={option === "Pyxis"}
            onClick={option.action}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
