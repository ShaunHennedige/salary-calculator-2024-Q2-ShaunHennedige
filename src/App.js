import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faRedo, faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function App() {
  const [basicSalary, setBasicSalary] = useState('');
  const [earnings, setEarnings] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showDeductionsModal, setShowDeductionsModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', amount: 0, epfEtf: false });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingType, setEditingType] = useState('');
  const [salary, setSalary] = useState({
    basicSalary: 0,
    grossEarnings: 0,
    grossDeduction: 0,
    employeeEPF: 0,
    apit: 0,
    netSalary: 0,
    employerEPF: 0,
    employerETF: 0,
    ctc: 0
  });

  const pdfRef = useRef(null);

  useEffect(() => {
    calculateSalary();
  }, [basicSalary, earnings, deductions]);

  const calculateSalary = () => {
    if (!basicSalary) {
      setSalary({
        basicSalary: 0,
        grossEarnings: 0,
        grossDeduction: 0,
        employeeEPF: 0,
        apit: 0,
        netSalary: 0,
        employerEPF: 0,
        employerETF: 0,
        ctc: 0
      });
      return;
    }

    let totalEarnings = Number(basicSalary);
    let totalEarningsForEPF = Number(basicSalary);
    let grossDeduction = 0;

    earnings.forEach(item => {
      totalEarnings += item.amount;
      if (item.epfEtf) totalEarningsForEPF += item.amount;
    });

    deductions.forEach(item => {
      grossDeduction += item.amount;
    });

    const grossEarnings = totalEarnings - grossDeduction;
    const grossSalaryForEPF = totalEarningsForEPF - grossDeduction;

    const employeeEPF = grossSalaryForEPF * 0.08;
    const employerEPF = grossSalaryForEPF * 0.12;
    const employerETF = grossSalaryForEPF * 0.03;

    // Simplified APIT calculation (you may need to adjust this based on the official IRD document)
    const apit = Math.max((grossEarnings * 0.18) - 25500, 0);

    const netSalary = grossEarnings - employeeEPF - apit;
    const ctc = grossEarnings + employerEPF + employerETF;

    setSalary({
      basicSalary: Number(basicSalary),
      grossEarnings,
      grossDeduction,
      employeeEPF,
      apit,
      netSalary,
      employerEPF,
      employerETF,
      ctc
    });
  };

  const handleAddItem = (type) => {
    if (editingIndex !== -1) {
      // Editing existing item
      if (type === 'earnings') {
        const updatedEarnings = [...earnings];
        updatedEarnings[editingIndex] = newItem;
        setEarnings(updatedEarnings);
      } else {
        const updatedDeductions = [...deductions];
        updatedDeductions[editingIndex] = newItem;
        setDeductions(updatedDeductions);
      }
      setEditingIndex(-1);
    } else {
      // Adding new item
      if (type === 'earnings') {
        setEarnings([...earnings, newItem]);
      } else {
        setDeductions([...deductions, newItem]);
      }
    }
    setNewItem({ name: '', amount: 0, epfEtf: false });
    setShowEarningsModal(false);
    setShowDeductionsModal(false);
  };

  const handleDeleteItem = (index, type) => {
    if (type === 'earnings') {
      setEarnings(earnings.filter((_, i) => i !== index));
    } else {
      setDeductions(deductions.filter((_, i) => i !== index));
    }
  };

  const handleEditItem = (index, type) => {
    const item = type === 'earnings' ? earnings[index] : deductions[index];
    setNewItem({ ...item });
    setEditingIndex(index);
    setEditingType(type);
    if (type === 'earnings') {
      setShowEarningsModal(true);
    } else {
      setShowDeductionsModal(true);
    }
  };

  const handleReset = () => {
    setBasicSalary('');
    setEarnings([]);
    setDeductions([]);
  };

  const downloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('salary_calculation.pdf');
    });
  };

  return (
    <div className="container-fluid mt-3 mt-md-5">
      <h2 className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <span className="mb-2 mb-md-0">Calculate Your Salary</span>
        <Button variant="primary" onClick={downloadPDF} className="w-20 w-md-auto">
          <FontAwesomeIcon icon={faDownload} /> Download PDF
        </Button>
      </h2>
      <div ref={pdfRef}>
        <div className="row">
          <div className="col-12 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title d-flex justify-content-between align-items-center">
                  Calculate Your Salary
                  <button className="btn btn-sm btn-outline-secondary" onClick={handleReset}>
                    <FontAwesomeIcon icon={faRedo} /> Reset
                  </button>
                </h5>
                <div className="mb-3">
                  <label htmlFor="basicSalary" className="form-label">Basic Salary</label>
                  <input
                    type="number"
                    className="form-control"
                    id="basicSalary"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                  />
                </div>
                <h6>Earnings</h6>
                <ul className="list-group mb-3">
                  {earnings.map((item, index) => (
                    <li key={index} className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                      <div className="mb-2 mb-sm-0">
                        {item.name}: {item.amount.toFixed(2)} {item.epfEtf && '✓ EPF/ETF'}
                      </div>
                      <div>
                        <button className="btn btn-sm btn-link text-primary me-2" onClick={() => handleEditItem(index, 'earnings')}>
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteItem(index, 'earnings')}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button className="btn btn-link w-100 text-start" onClick={() => { setShowEarningsModal(true); setEditingIndex(-1); }}>+ Add New Allowance</button>
                <h6 className="mt-3">Deductions</h6>
                <ul className="list-group mb-3">
                  {deductions.map((item, index) => (
                    <li key={index} className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                      <div className="mb-2 mb-sm-0">
                        {item.name}: {item.amount.toFixed(2)}
                      </div>
                      <div>
                        <button className="btn btn-sm btn-link text-primary me-2" onClick={() => handleEditItem(index, 'deductions')}>
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteItem(index, 'deductions')}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button className="btn btn-link w-100 text-start" onClick={() => { setShowDeductionsModal(true); setEditingIndex(-1); }}>+ Add New Deduction</button>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Your salary</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Items</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Basic Salary</td>
                        <td className="text-end">{salary.basicSalary.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Gross Earning</td>
                        <td className="text-end">{salary.grossEarnings.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Gross Deduction</td>
                        <td className="text-end">-{salary.grossDeduction.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Employee EPF (8%)</td>
                        <td className="text-end">-{salary.employeeEPF.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>APIT</td>
                        <td className="text-end">-{salary.apit.toFixed(2)}</td>
                      </tr>
                      <tr className="fw-bold">
                        <td>Net Salary (Take Home)</td>
                        <td className="text-end">{salary.netSalary.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="text-muted">Contribution from the Employer</td>
                      </tr>
                      <tr>
                        <td>Employer EPF (12%)</td>
                        <td className="text-end">{salary.employerEPF.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Employer ETF (3%)</td>
                        <td className="text-end">{salary.employerETF.toFixed(2)}</td>
                      </tr>
                      <tr className="fw-bold">
                        <td>CTC (Cost to Company)</td>
                        <td className="text-end">{salary.ctc.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showEarningsModal || showDeductionsModal} onHide={() => { setShowEarningsModal(false); setShowDeductionsModal(false); setEditingIndex(-1); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingIndex !== -1 ? 'Edit' : 'Add New'} {showEarningsModal ? 'Earnings' : 'Deductions'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{showEarningsModal ? 'Earnings' : 'Deductions'} Name</Form.Label>
              <Form.Control type="text" placeholder="E.g. Travel" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" placeholder="E.g. 10000" value={newItem.amount} onChange={(e) => setNewItem({...newItem, amount: Number(e.target.value)})} />
            </Form.Group>
            {showEarningsModal && (
              <Form.Group className="mb-3">
                <Form.Check type="checkbox" label="EPF/ETF" checked={newItem.epfEtf} onChange={(e) => setNewItem({...newItem, epfEtf: e.target.checked})} />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowEarningsModal(false); setShowDeductionsModal(false); setEditingIndex(-1); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleAddItem(showEarningsModal ? 'earnings' : 'deductions')}>
            {editingIndex !== -1 ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;