import { NextResponse } from "next/server";

// Interface for the incoming form data
interface OrderFormData {
  eventDate: string;
  eventMonth: string;
  eventYear: string;
  groomName: string;
  brideName: string;
  contact: string;
  timeFrom: string;
  addressVenueHall: string;
  receptionDate: string;
  receptionTime: string;
  receptionVenue: string;
  address: string;
  addressGroomBride: string;
  groomBrideContact: string;
  personPlacedOrder: string;
  relation: string;
  services: {
    normalPhotography: boolean;
    normalVideo: boolean;
    candidPhotography: boolean;
    candidVideo: boolean;
    numberOfPages: string;
    numberOfAlbum: string;
    numberOfPhotographer: string;
    droneCam: boolean;
    outDoorShoot: boolean;
    photoBooth: boolean;
    livePrinting: boolean;
  };
  budget: string;
  bookingAdvance: string;
}

export const POST = async (req: Request) => {
  try {
    const formData: OrderFormData = await req.json();

    // Generate the filled form as HTML with inline CSS
    const filledFormHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px;
      background: white;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
    }
    .title {
      text-align: center;
      font-size: 48px;
      font-weight: 100;
      letter-spacing: 2px;
      margin-bottom: 40px;
      color: #333;
    }
    .section {
      margin-bottom: 20px;
    }
    .label {
      font-weight: bold;
      display: inline-block;
      min-width: 150px;
      font-size: 14px;
    }
    .value {
      display: inline;
      border-bottom: 1px dotted #999;
      padding: 2px 10px;
      min-width: 200px;
      font-size: 14px;
    }
    .row {
      margin-bottom: 15px;
      line-height: 1.8;
    }
    .date-fields {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 20px;
    }
    .date-box {
      border: 1px solid #333;
      padding: 8px 15px;
      min-width: 80px;
      text-align: center;
      font-size: 14px;
    }
    .services-section {
      margin-top: 30px;
      margin-bottom: 30px;
    }
    .service-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #333;
      display: inline-block;
      margin-right: 15px;
      position: relative;
    }
    .checkbox.checked::after {
      content: '✓';
      position: absolute;
      top: -2px;
      left: 3px;
      font-size: 18px;
      color: #333;
    }
    .service-label {
      font-size: 14px;
      min-width: 200px;
    }
    .service-value {
      border: 1px solid #333;
      padding: 5px 15px;
      min-width: 80px;
      text-align: center;
      font-size: 14px;
    }
    .terms-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .terms-title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 15px;
    }
    .terms-text {
      font-size: 12px;
      line-height: 1.6;
      margin-bottom: 10px;
      text-align: justify;
    }
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-block {
      width: 45%;
    }
    .signature-label {
      font-size: 14px;
      margin-bottom: 5px;
    }
    .signature-line {
      border-bottom: 1px solid #333;
      margin-top: 5px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">Order form</h1>
    
    <div class="section">
      <div class="date-fields">
        <span class="label">Event Date</span>
        <span class="date-box">${formData.eventDate || ""}</span>
      </div>
      
      <div class="date-fields">
        <span class="label">Event Month</span>
        <span class="date-box" style="min-width: 150px;">${
          formData.eventMonth || ""
        }</span>
      </div>
      
      <div class="date-fields">
        <span class="label">Event Year</span>
        <span class="date-box">${formData.eventYear || ""}</span>
      </div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Work for: Groom / Bride</span>
      </div>
      <div class="row">
        <span class="label">Groom Name:</span>
        <span class="value">${formData.groomName || ""}</span>
        <span class="label" style="margin-left: 20px;">Bride Name:</span>
        <span class="value">${formData.brideName || ""}</span>
      </div>
      <div class="row">
        <span class="label">Contact:</span>
        <span class="value">${formData.contact || ""}</span>
      </div>
      <div class="row">
        <span class="label">Time from:</span>
        <span class="value">${formData.timeFrom || ""}</span>
      </div>
      <div class="row">
        <span class="label">Address of Venue/Hall:</span>
        <span class="value">${formData.addressVenueHall || ""}</span>
      </div>
      <div class="row">
        <span class="label">Reception date:</span>
        <span class="value">${formData.receptionDate || ""}</span>
        <span class="label" style="margin-left: 20px;">Time:</span>
        <span class="value">${formData.receptionTime || ""}</span>
        <span class="label" style="margin-left: 20px;">Venue:</span>
        <span class="value">${formData.receptionVenue || ""}</span>
      </div>
      <div class="row">
        <span class="label">Address:</span>
        <span class="value">${formData.address || ""}</span>
      </div>
      <div class="row">
        <span class="label">Address of Groom/Bride (other party):</span>
        <span class="value">${formData.addressGroomBride || ""}</span>
      </div>
      <div class="row">
        <span class="value" style="float: right;">Contact: ${
          formData.groomBrideContact || ""
        }</span>
      </div>
      <div class="row">
        <span class="label">Name of person placed the order:</span>
        <span class="value">${formData.personPlacedOrder || ""}</span>
        <span class="label" style="margin-left: 20px;">Relation:</span>
        <span class="value">${formData.relation || ""}</span>
      </div>
    </div>

    <div class="services-section">
      <div class="service-row">
        <div class="checkbox ${
          formData.services.normalPhotography ? "checked" : ""
        }"></div>
        <span class="service-label">Normal photography</span>
      </div>
      <div class="service-row">
        <div class="checkbox ${
          formData.services.normalVideo ? "checked" : ""
        }"></div>
        <span class="service-label">Normal video</span>
      </div>
      <div class="service-row">
        <div class="checkbox ${
          formData.services.candidPhotography ? "checked" : ""
        }"></div>
        <span class="service-label">Candid photography</span>
      </div>
      <div class="service-row">
        <div class="checkbox ${
          formData.services.candidVideo ? "checked" : ""
        }"></div>
        <span class="service-label">Candid video</span>
      </div>
      <div class="service-row">
        <div class="checkbox"></div>
        <span class="service-label">Number of pages</span>
        <span class="service-value">${
          formData.services.numberOfPages || ""
        }</span>
      </div>
      <div class="service-row">
        <div class="checkbox"></div>
        <span class="service-label">Number of album</span>
        <span class="service-value">${
          formData.services.numberOfAlbum || ""
        }</span>
      </div>
      <div class="service-row">
        <div class="checkbox"></div>
        <span class="service-label">Number of photographer</span>
        <span class="service-value">${
          formData.services.numberOfPhotographer || ""
        }</span>
      </div>
      <div class="service-row">
        <div class="checkbox ${
          formData.services.droneCam ? "checked" : ""
        }"></div>
        <span class="service-label">Drone cam</span>
      </div>
      <div class="service-row">
        <div class="checkbox ${
          formData.services.outDoorShoot ? "checked" : ""
        }"></div>
        <span class="service-label">Out door shoot</span>
      </div>
      <div class="service-row">
        <div class="checkbox ${
          formData.services.photoBooth ? "checked" : ""
        }"></div>
        <span class="service-label">Photo booth</span>
      </div>
      <div class="service-row">
        <div class="checkbox ${
          formData.services.livePrinting ? "checked" : ""
        }"></div>
        <span class="service-label">Live printing</span>
      </div>
    </div>

    <div class="section">
      <div class="row">
        <span class="label">Budget of the Photography / Video</span>
        <span class="value">${formData.budget || ""}</span>
      </div>
      <div class="row">
        <span class="label">Booking advance (20%)</span>
        <span class="value">${formData.bookingAdvance || ""}</span>
      </div>
    </div>

    <div class="terms-section">
      <div class="terms-title">Terms & Conditions:</div>
      <div class="terms-text">
        Any additional jobs which are not quoted in this quotation will be charged extra. Travel 
        and Accommodation expenses are not included in this quotation, and will be charged extra 
        for out side Calicut.
      </div>
      <div class="terms-text">
        70% quoted amount should be paid in advance, 30% of quoted amount should be paid 
        on the day of delivery.
      </div>
      <div class="terms-text">
        We are not responsible for any losses caused by circumstances outside our control 
        including natural disaster, power outages, technical difficulties, fire, or any other 
        unforeseen occurrence that prevents service from running normally.
      </div>
      <div class="terms-text">
        By this contract between the photographer and the client, 
        it is mutually agreed that the photographers shall provide services and / or good as specified, 
        and that the client shall pay the photographers the amounts due for the said services and / 
        or goods. If the party do not respond on time, make delay for outdoor photography, 
        selection of pictures, it may delay to produce final out on time.
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-block">
        <div class="signature-label">Date:</div>
        <div class="signature-line"></div>
      </div>
      <div class="signature-block">
        <div class="signature-label">Client Name:</div>
        <div class="signature-line"></div>
        <div class="signature-label">Client Signature:</div>
        <div class="signature-line"></div>
        <div class="signature-label">Signature:</div>
        <div class="signature-line"></div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Convert HTML to base64
    const base64HTML = Buffer.from(filledFormHTML).toString("base64");

    return NextResponse.json(
      {
        status: "Success",
        message: "Order form generated successfully",
        data: {
          html: filledFormHTML,
          base64: base64HTML,
          // You can display this in an iframe: <iframe src={`data:text/html;base64,${base64}`} />
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while generating order form", error);
    return NextResponse.json(
      {
        status: "Failed",
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
