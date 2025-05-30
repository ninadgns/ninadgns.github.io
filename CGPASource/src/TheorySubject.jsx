import * as React from 'react';
import InputSlider from './InputSlider';
import { Box, Typography } from '@mui/material';
import { Grid } from '@mui/material';
export default function TheorySubject({ SubjectName, returnGradePoint }) {
    const [Incourse, setIncourse] = React.useState(30);
    const [TermFinal, setTermFinal] = React.useState(70);

    let Mark = Incourse + TermFinal;
    let grade, gradePoint;
    if (Mark >= 80) { grade = "A+"; gradePoint = "4.00"; }
    else if (Mark >= 75) { grade = "A"; gradePoint = "3.75"; }
    else if (Mark >= 70) { grade = "A-"; gradePoint = "3.50"; }
    else if (Mark >= 65) { grade = "B+"; gradePoint = "3.25"; }
    else if (Mark >= 60) { grade = "B"; gradePoint = "3.00"; }
    else if (Mark >= 55) { grade = "B-"; gradePoint = "2.75"; }
    else if (Mark >= 50) { grade = "C+"; gradePoint = "2.50"; }
    else if (Mark >= 45) { grade = "C"; gradePoint = "2.25"; }
    else if (Mark >= 40) { grade = "D"; gradePoint = "2.00"; }
    else { grade = "F"; gradePoint = "0.00"; }
    returnGradePoint(gradePoint)

    return (
        <Grid container sx={{borderStyle:'dashed', borderColor:'lightblue'}} marginBottom={1} padding={1}>
            <Grid xs={12} md={2}>
                <Typography variant='h6'>{SubjectName}</Typography>
            </Grid>
            <Grid xs={12} md={2}>
                <p>Total Mark: <b>{Mark}</b>   </p>
                <p>Grade: <b>{grade}</b>   </p>
                <p>Grade Point: <b>{gradePoint}</b></p>
            </Grid>
            <Grid xs={12} md={3}>
                <InputSlider sliderWidth={2} examName={"Incourse"} defaultValue={30} maxValue={30} minValue={1} returnValue={setIncourse}></InputSlider>
            </Grid>
            <Grid xs={12} md={5}>
                <InputSlider sliderWidth={3} examName={"Term Final"} defaultValue={70} maxValue={70} minValue={1} returnValue={setTermFinal}></InputSlider>
            </Grid>
        </Grid >
    )
}