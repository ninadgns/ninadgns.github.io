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

export default function InputSlider({ defaultValue, maxValue, returnValue, examName, minValue, stepValue, textVisibility }) {
  const [value, setValue] = React.useState(defaultValue);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    returnValue(newValue || defaultValue);
  };

  const handleInputChange = (event, newValue) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));
    newValue = Number(event.target.value)
    returnValue(newValue || defaultValue);
  };


  return (

    <Box width="1" >
      <Typography variant='h5'>{examName}</Typography>
      <Grid container spacing={2} alignItems="centers" xs={12} >
        <Grid item xs>
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
            disableUnderline={false}
            onChange={handleInputChange}
            sx={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '0px 11px',
              backgroundColor: '#fff',
              '&:hover': {
                borderColor: '#999',
              },
              '&:focus-within': {
                borderColor: '#1976d2',
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
              },
              '& input[type=number]': {
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  '-webkit-appearance': 'none',
                  margin: 0,
                },
                '&[type=number]': {
                  '-moz-appearance': 'textfield',
                },
              }
            }}
            inputProps={{
              step: 1,
              min: minValue,
              max: maxValue,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}