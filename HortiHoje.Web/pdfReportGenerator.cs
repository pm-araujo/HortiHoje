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
            document.Open();
            PdfWriter.GetInstance(document, new FileStream(name, FileMode.Create));
        }

        public void closeDocument()
        {
            document.Close();
        }

        public void generateFromActivity(Activity activity)
        {
            Paragraph paragraph;
            paragraph = new Paragraph();
            paragraph.Add("Activity Name: ");
            paragraph.Add(activity.Name);
            paragraph.Add("Activity Description: " );
            paragraph.Add(activity.Description);

            document.Add(paragraph);

        }

        private void printTask(Task task)
        {
            Paragraph paragraph;
            paragraph = new Paragraph();
            paragraph.Add("Task Name:");
            paragraph.Add("\t" + task.Name);
            paragraph.Add("Task Description:");
            paragraph.Add("\t" + task.Description);
            paragraph.Add("Latitude:");
            paragraph.Add("\t" + task.Location.Lat);
            paragraph.Add("Longitude:");
            paragraph.Add("\t" + task.Description);
            document.Add(paragraph);
        }

        private void printTaskList(IQueryable<Task> tasks)
        {
            Paragraph paragraph;
            List list;
            foreach (Task task in tasks)
            {
                printTask(task);
            }
        }

        private void printFieldNoteList(IQueryable<FieldNote> fieldNotes)
        {
            List list;
            list = new List();
            foreach (FieldNote fieldNote in fieldNotes)
            {
                list.Add(fieldNote.Title);
                list.Add(new Paragraph(fieldNote.Description));
            }
            document.Add(list);
        }
        private void printAllocatedTARList(IQueryable<TaskAllocatedReporter> reporters)
        {
            List list;
            list = new List();
            foreach (TaskAllocatedReporter reporter in reporters)
            {
                list.Add(reporter.Reporter.Name);
            }
            document.Add(list);
        }
        private void printReporterList(IQueryable<Reporter> reporters)
        {
            List list;
            list = new List();
            foreach (Reporter reporter in reporters)
            {
                list.Add(reporter.Name);
            }
            document.Add(list);
        }
        private void printAllowedTARList(IQueryable<TaskAllowedReporter> reporters)
        {
            List list;
            list = new List();
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