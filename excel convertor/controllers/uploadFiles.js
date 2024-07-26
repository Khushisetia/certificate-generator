const excelData = require("../model/excelData");
const xlsx = require("xlsx");
const ejs=require("ejs");
const pdf=require("html-pdf");
const path=require("path");
const nodemailer=require("nodemailer");


exports.uploadFiles=async(req, res)=>{
    const file = req.file;
    try {
      const workbook = xlsx.readFile(file.path);
      const sheet_name_list = workbook.SheetNames;
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
      
      for(let i=0;i<data.length;i++){
          data[i].number_of_trees=Math.floor((data[i].amount)/100);
        //   console.log('data',data[i])
          const createData=await excelData.create(data[i]);
        //   console.log('createData',createData);

      }
      console.log('data',data);
      for(let i=0;i<data.length;i++){
        res.render("../views/index.ejs",{
          name:data[i].name,
          email:data[i].email,
          mobile_number:data[i].mobile_number,
          amount:data[i].amount,
          number_of_trees:data[i].number_of_trees
      },(err,html)=>{
        if(err){
          console.log("error while rendering");
        }else{
          let options={
            height:"11.25in",
            width:"8.5in",
            header:{
              height:"20mm"
            },
            footer:{
              height:"20mm"
            }
          };
          pdf.create(html,options).toFile(`certificate${data[i].id}_${data[i].name}.pdf`,(err,html)=>{
            if(err){
              console.log("pdf not created");
            } else{
              
              console.log("file created succesfully");
              const nodemailer=require("nodemailer");
              let mailTransporter=nodemailer.createTransport({
                service:"gmail",
                auth:{
                  user:"khushisetia453@gmail.com",
                  pass:"bwwj lgkb rjed ldlb"
                }
              });
              let mailDetails={
                from:"",
                to:data[i].email,
                subject:"Donation certificate",
                text:`Thankyou, ${data[i].name} for donating Rs${data[i].amount} for ${data[i].number_of_trees} Trees❤️❤️`,
                attachments:[
                  {
                    path:html.filename
                  }
                ]
                
              }
              mailTransporter.sendMail(mailDetails,(err,html)=>{
                if(err){
                  console.log("error occurred");
                }else{
                  console.log(`Email sent successfully ${data[i].id}`);
                }
              })



            }})
      }});
        }
        res.json({ message: "uploaded and converted the file to JSON", data });
    } catch (error) {
      console.error("Error converting Excel to JSON:", error);
      res
      .status(500)
        .json({
          message: "Error converting Excel to JSON",
          error: error.message,
        });
    }
  }