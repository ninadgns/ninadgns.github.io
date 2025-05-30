import * as React from 'react';
import TheorySubject from './TheorySubject'
import LabSubject from './LabSubject'
import PrevCGPA from './PrevCGPA';
import { Box } from '@mui/material';
import { spacing } from '@mui/system';

import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
export default function Twotwo() {
  const [DBMSGradePoint, setDBMSGradePoint] = React.useState(4.00);
  const [AlgorithmGradePoint, setAlgorithmGradePoint] = React.useState(4.00);
  const [DataComGradePoint, setDataComGradePoint] = React.useState(4.00);
  const [CAOGradePoint, setCAOGradePoint] = React.useState(4.00);
  const [MechatronicsGradePoint, setMechatronicsGradePoint] = React.useState(4.00);
  const [DBMALabGradePoint, setDBMALabGradePoint] = React.useState(4.00);
  const [DataComLabGradePoint, setDataComLabGradePoint] = React.useState(4.00);
  const [AlgorithmLabGradePoint, setAlgorithmLabGradePoint] = React.useState(4.00);
  const [AndroidLabGradePoint, setAndroidLabGradePoint] = React.useState(4.00);
  const [OldCGPA, setOldCGPA] = React.useState(4.00)
  let cgpa = 4;
  cgpa =
    3 * (
      parseFloat(DBMSGradePoint) +
      parseFloat(AlgorithmGradePoint) +
      parseFloat(DataComGradePoint) +
      parseFloat(CAOGradePoint)
    ) +
    
    2 * parseFloat(MechatronicsGradePoint) +

    1.5 * (
      parseFloat(DBMALabGradePoint) +
      parseFloat(AlgorithmLabGradePoint) +
      parseFloat(AndroidLabGradePoint)
    ) +

    .75 * parseFloat(DataComLabGradePoint);

  let gpa = cgpa / 19.25
  gpa = gpa.toFixed(2)
  cgpa += OldCGPA * 55.75
  cgpa /= (19.25 + 55.75)

  cgpa = cgpa.toFixed(2)


  return (
    <Box sx={{ paddingX: 1 }}>
      <Grid zIndex={1} style={{ position: 'fixed', width: '100vw', left: '50%', transform: 'translate(-50%, 0%)', backgroundColor: 'white' }} >
        <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column' }}  >
          <p className='m-auto  h2'>CGPA Calculator</p>
          <p className='m-auto  h6'>CSEDU28 2-2</p>
        </Box>
        <Box marginTop={2} display={'flex'} flexDirection={'row'} justifyContent={"space-evenly"}>

          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>2-2 GPA: {gpa}</Typography>
          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>CGPA: {cgpa}</Typography>
        </Box>
      </Grid>
      <Grid marginBottom={1} style={{ paddingTop: '150px' }} alignItems={"center"} display={'flex'} flexDirection={"column"}>
        <PrevCGPA setCGPA={setOldCGPA}></PrevCGPA>
      </Grid>
      <Grid container justifyContent={'space-around'} marginBottom={5}  >
        <Grid width={{ xs: "100%", md: "69%" }}>
          <TheorySubject SubjectName={"DBMS"} returnGradePoint={setDBMSGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"Mechatronics"} returnGradePoint={setMechatronicsGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"Computer Architecture"} returnGradePoint={setCAOGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"Algorithnm"} returnGradePoint={setAlgorithmGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"DataCom"} returnGradePoint={setDataComGradePoint}></TheorySubject>
        </Grid>
        <Grid width={{ xs: "100%", md: "28%" }} marginBottom={5}  >
          <LabSubject SubjectName={"DBMS Lab"} returnGradePoint={setDBMALabGradePoint}></LabSubject>
          <LabSubject SubjectName={"DataCom Lab ☠️"} returnGradePoint={setDataComLabGradePoint}></LabSubject>
          <LabSubject SubjectName={"Algorithm Lab"} returnGradePoint={setAlgorithmLabGradePoint}></LabSubject>
          <LabSubject SubjectName={"Android Lab"} returnGradePoint={setAndroidLabGradePoint}></LabSubject>
        </Grid>
      </Grid>
    </Box>)
}
