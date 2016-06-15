using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Speech.Recognition;
using System.Text;
using System.Windows.Forms;

namespace SpeechRecognition
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }
        

        private void startButton_Click(object sender, EventArgs e)
        {
            SpeechRecognitionEngine speechRecognitionEngine = new SpeechRecognitionEngine();
            Grammar grammar = new DictationGrammar();
            speechRecognitionEngine.LoadGrammar(grammar);
            speechRecognitionEngine.SetInputToDefaultAudioDevice();
            speechRecognitionEngine.RecognizeCompleted += new EventHandler<RecognizeCompletedEventArgs>(handleSpeechCompleted);
            speechRecognitionEngine.SpeechRecognized += new EventHandler<SpeechRecognizedEventArgs>(handleSpeechRec);
            speechRecognitionEngine.RecognizeAsync(RecognizeMode.Multiple);
        }

        private void handleSpeechCompleted(object sender, RecognizeCompletedEventArgs args)
        {
            MessageBox.Show("Speech recognized: " + args.Result.Text);
        }
        private void handleSpeechRec(object sender, SpeechRecognizedEventArgs args)
        {
            MessageBox.Show("Speech recognized: " + args.Result.Text);
        }
    }
}
