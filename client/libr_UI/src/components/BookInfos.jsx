//Styles imports
import "./compStyles/bookinfos.css";
//MUI import comps and icons
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  Label as LabelIcon,
  Person as PersonIcon,
  MenuBook as MenuBookIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

export default function BookInfos({ book, setCloseDialog }) {
  if (!book) return null;

  return (
    <Dialog
      open={true}
      onClose={() => setCloseDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>Book Details</Typography>
        <IconButton
          onClick={() => setCloseDialog(false)}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Book Image */}
          <Box
            component="img"
            src={book.posterUrl}
            alt={book.title}
            sx={{
              width: "100%",
              borderRadius: 1,
              boxShadow: 2,
              maxHeight: 300,
              objectFit: "cover",
            }}
          />

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.3rem",
              lineHeight: 1.3,
              mt: 1,
            }}
          >
            {book.title}
          </Typography>

          {/* Author */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonIcon sx={{ color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {book.author}
            </Typography>
          </Box>

          {/* Theme */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LabelIcon sx={{ color: "text.secondary" }} />
            <Chip
              label={book.theme}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            />
          </Box>

          {/* Code */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MenuBookIcon sx={{ color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Code: <strong>{book.code}</strong>
            </Typography>
          </Box>

          {/* Location */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LocationOnIcon sx={{ color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {book.location}
            </Typography>
          </Box>

          {/* Availability */}
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              padding: 1.5,
              borderRadius: 1,
              backgroundColor: book.isAvailable ? "#e8f5e9" : "#ffebee",
            }}
          >
            <CheckCircleIcon
              sx={{
                color: book.isAvailable ? "#2e7d32" : "#c62828",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: book.isAvailable ? "#2e7d32" : "#c62828",
              }}
            >
              {book.isAvailable ? "Available" : "Not Available"}
            </Typography>
          </Paper>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 600,
                py: 1.2,
              }}
            >
              {book.isAvailable ? "Borrow Book" : "Request Book"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 600,
                py: 1.2,
              }}
            >
              Add to Favorites
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
