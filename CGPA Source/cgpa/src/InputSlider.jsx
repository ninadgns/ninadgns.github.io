import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import { Typography } from '@mui/material';

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function InputSlider({ sliderWidth, defaultValue, maxValue, returnValue, examName, minValue, stepValue, textVisibility }) {
  const [value, setValue] = React.useState(defaultValue);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    returnValue(newValue || defaultValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));
    returnValue(newValue);
  };


  // console.log(minValue)
  return (

    <Box width="1">
      <Typography variant='h5'>{examName}</Typography>
      {/* <h2 style={{margin: "0px 10px"}}>{examName}</h2> */}
      <Grid container spacing={2} alignItems="centers" xs={12}>
        <Grid item xs >
          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            textVisibility={textVisibility}
            max={maxValue}
            min={minValue}
            step={stepValue}
          />
        </Grid>
        <Grid item visibility={textVisibility}>
          <Input
            value={value}
            size="medium"
            disableUnderline={true}
            onChange={handleInputChange}
            inputProps={{
              step: 1,

              min: { minValue },
              max: { maxValue },
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}