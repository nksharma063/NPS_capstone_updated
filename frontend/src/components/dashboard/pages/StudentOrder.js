import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';

// Generate Order Data
function createData(id, name, email, phoneno, batch, program, npstype, npsstatus) {
  return { id, name, email, phoneno, batch, program, npstype, npsstatus };
}



function preventDefault(event) {
  event.preventDefault();
}

export default function StudentOrders(props) {
  console.log('Data received: ', props.response)
  const rows = props.response.map(data => {
    return createData(
      data._id,
      data.studentId.name,
      data.studentId.email,
      data.studentId.phoneNo,
      data.studentId.batchid, // Update with appropriate batch data
      data.studentId.batchid, // Update with appropriate program data
      data.npsType,
      data.completionStatus
    );
  })
  console.log('Value of rows: ',rows)
  return (
    <React.Fragment>
      <Title>{props.title}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone no.</TableCell>
            <TableCell>Batch</TableCell>
            <TableCell>Program</TableCell>
            <TableCell>NPS Type</TableCell>
            <TableCell>NPS Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            console.log('Current Row: ',row)
            return(
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phoneno}</TableCell>
              <TableCell>{row.batch.batchName}</TableCell>
              <TableCell>{row.program.programId.programName}</TableCell>
              <TableCell>{row.npstype}</TableCell>
              <TableCell>{row.npsstatus}</TableCell>
            </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}