using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using HortiHoje.Model;
using iTextSharp.text;
using iTextSharp;
using iTextSharp.text.pdf;

namespace HortiHoje
{
    public class pdfReportGenerator
    {
        public pdfReportGenerator(string name)
        {
            document = new Document();
            PdfWriter.GetInstance(document, new FileStream(name, FileMode.Create));
            document.Open();

        }

        public void closeDocument()
        {
            document.CloseDocument();
        }

        public void generateFromActivity(Activity activity)
        {
            Paragraph paragraph;
            paragraph = new Paragraph();
            paragraph.Add("Activity Name: ");
            paragraph.Add(activity.Name);

            document.Add(paragraph);
            paragraph= new Paragraph();
            paragraph.Add("Activity Description: " );
            paragraph.Add(activity.Description);

            document.Add(paragraph);

        }

        public void printTask(Task task)
        {
            Paragraph paragraph;
            paragraph = new Paragraph();
            paragraph.Add("Task Name:");
            paragraph.Add("\t" + task.Name);

            document.Add(paragraph);
            paragraph = new Paragraph();


            paragraph.Add("Task Description:");
            paragraph.Add("\t" + task.Description);

            document.Add(paragraph);
            paragraph = new Paragraph();


            paragraph.Add("Latitude:");
            paragraph.Add("\t" + task.Location.Lat);

            document.Add(paragraph);
            paragraph = new Paragraph();

            paragraph.Add("Longitude:");
            paragraph.Add("\t" + task.Location.Long);
            document.Add(paragraph);
        }

        public void printTaskList(ICollection<Task> tasks)
        {
            Paragraph paragraph;
            List list;
            foreach (Task task in tasks)
            {
                printTask(task);
            }
        }

        public void printFieldNoteList(ICollection<FieldNote> fieldNotes)
        {
            List list;
            Paragraph paragraph;

            list = new List();
            paragraph = new Paragraph();
            paragraph.Add("Field Notes:");
            document.Add(paragraph);
            foreach (FieldNote fieldNote in fieldNotes)
            {
                list.Add(fieldNote.Title);
                list.Add(new Paragraph(fieldNote.Description));
            }
            document.Add(list);
        }
        public void printAllocatedTARList(ICollection<TaskAllocatedReporter> reporters)
        {
            List list;
            Paragraph paragraph;

            list = new List();
            paragraph = new Paragraph();

            paragraph.Add("Allocated Reporters:");
            document.Add(paragraph);
            foreach (TaskAllocatedReporter reporter in reporters)
            {
                list.Add(reporter.Reporter.Name);
            }
            document.Add(list);
        }
        private void printReporterList(ICollection<Reporter> reporters)
        {
            List list;
            list = new List();
            foreach (Reporter reporter in reporters)
            {
                list.Add(reporter.Name);
            }
            document.Add(list);
        }
        public void printAllowedTARList(ICollection<TaskAllowedReporter> reporters)
        {
            List list;
            Paragraph paragraph;

            list = new List();
            paragraph = new Paragraph();

            paragraph.Add("Allowed Reporters:");
            document.Add(paragraph);
            foreach (TaskAllowedReporter reporter in reporters)
            {
                list.Add(reporter.Reporter.Name);
            }
            document.Add(list);
        }

        Document document;
        Font normal = new Font(Font.FontFamily.COURIER, 9f);
        Font bold = new Font(Font.FontFamily.COURIER, 14f, Font.BOLD);
    }
}