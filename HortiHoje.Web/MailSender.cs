using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Web;
using System.Web.Mail;
using MailMessage = System.Net.Mail.MailMessage;

namespace HortiHoje
{
    public class MailSender
    {
        public MailSender(string filename, string to)
        {
            MailMessage o = new MailMessage("hortihoje@outlook.com", to, "Report","");
            NetworkCredential netCred = new NetworkCredential("hortihoje@outlook.com", "verySecurePassword");
            Attachment attachment = new Attachment(filename);
            o.Attachments.Add(attachment);
            SmtpClient smtpobj = new SmtpClient("smtp.live.com", 587);
            smtpobj.EnableSsl = true;
            smtpobj.Credentials = netCred;
            smtpobj.Send(o);
        }
    }
}