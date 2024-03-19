import * as React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { npsServiceUrl } from '../../../api/url';
import axios from 'axios';

export default function Orders(props) {
  const navigate = useNavigate(); // Initialize useNavigate
  const [mailSendMsg, setMailSendMsg] = React.useState('')

  // Update handleRowClick to use navigate method
  const handleRowClick = (id) => {
    navigate(`/userresponse/${id}`);
  };

  const sendEmail = async (resid, usrid) => {
    let respData = {
      responseId: resid,
      userId: usrid
    }
    let resD = await axios.post(`${npsServiceUrl}/npsresponse/resend`,respData)
    setMailSendMsg(resD.data.msg)
  } 

  return (
    <React.Fragment>
      <Title>{props.title}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>End Date</TableCell>
            <TableCell>NPS Campaign</TableCell>
            <TableCell>NPS Type</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Phone No.</TableCell>
            <TableCell>Program</TableCell>
            <TableCell>Batch</TableCell>
            <TableCell>NPS Status</TableCell>
            <TableCell>Resend</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((d) => (
            <TableRow key={d.userId} >
              <TableCell>{d.npsEndDate}</TableCell>
              <TableCell>{d.npsFormCode}</TableCell>
              <TableCell>{d.npsType}</TableCell>
              <TableCell onClick={() => handleRowClick(d.responseId)} style={{ cursor: 'pointer', color: 'red' }}>{d.name}</TableCell>
              <TableCell>{d.phoneNo}</TableCell>
              <TableCell>{d.programName}</TableCell>
              <TableCell>{d.batchName}</TableCell>
              <TableCell>{d.completionStatus}</TableCell>
              {d.completionStatus != "completed" ? 
              <TableCell onClick={()=>sendEmail(d.responseId, d.userId)} style={{ cursor: 'pointer', color: 'blue' }}>R</TableCell>
              :
              <TableCell>NA</TableCell>
             }
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link color="primary" sx={{ mt: 3 }}>
        {mailSendMsg}
      </Link>
    </React.Fragment>
  );
}
