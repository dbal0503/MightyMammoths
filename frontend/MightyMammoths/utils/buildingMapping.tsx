export function getBuildingAddress(abbreviation: string): string {
    const mapping: { [key: string]: string } = {
      EV: "Concordia University, EV Building, Montreal, QC",
      Hall: "Concordia University, Hall Building, Montreal, QC",
      JMSB: "Concordia University, John Molson School of Business, Montreal, QC",
      "CL Building": "Concordia University, CL Building, Montreal, QC",
      "Learning Square": "Concordia University, Learning Square, Montreal, QC",
      "Smith Building":
        "Concordia University Smith Building, Loyola Campus, Montreal, QC, Canada",
      "Hingston Hall":
        "Concordia University, Hingston Hall, Montreal, QC, Canada",
    };
  
    return mapping[abbreviation] || abbreviation;
  }