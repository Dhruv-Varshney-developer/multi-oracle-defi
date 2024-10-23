import { Box, CardContent, Grid, Paper, Typography } from "@mui/material";

import { StyledCard } from "./BankComponents";

export const InfoCard = ({ title, items, icon }) => (
  <StyledCard>
    <CardContent>
      <Box display="flex" alignItems="center" mb={3}>
        {icon}
        <Typography variant="h6" ml={1} color="white">
          {title}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {items.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                {item.label}
              </Typography>
              <Typography variant="h6" color="white" mt={0.5}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </StyledCard>
);
