using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Speech.AudioFormat;
using System.Speech.Recognition;
using System.Web;

namespace HortiHoje
{
    public class SpeechRecognition
    {
        /*
            Create using constructor
            Bind the event handlers as per commented example
            Set input
            Start recog
        */

        /*
        private void handleSpeechCompleted(object sender, RecognizeCompletedEventArgs args)
        {
            MessageBox.Show("Speech recognized: " + args.Result.Text);
        }
        private void handleSpeechRec(object sender, SpeechRecognizedEventArgs args)
        {
            MessageBox.Show("Speech recognized: " + args.Result.Text);
        }*/

        public SpeechRecognition()
        {
            speechRecognitionEngine = new SpeechRecognitionEngine();
            dictionGrammar = new DictationGrammar();
            speechRecognitionEngine.LoadGrammar(dictionGrammar);
        }

        public void bindRecognizeComplete(EventHandler<RecognizeCompletedEventArgs> handleSpeechCompleted)
        {
            speechRecognitionEngine.RecognizeCompleted += new EventHandler<RecognizeCompletedEventArgs>(handleSpeechCompleted);
        }

        public void bindSpeechRecognized(EventHandler<SpeechRecognizedEventArgs> handleSpeechRecognized)
        {
            speechRecognitionEngine.SpeechRecognized += new EventHandler<SpeechRecognizedEventArgs>(handleSpeechRecognized);
        }

        public void setInputToDefaultDevice()
        {
            speechRecognitionEngine.SetInputToDefaultAudioDevice();
        }

        public void setInputToWave(string path)
        {
            speechRecognitionEngine.SetInputToWaveFile(path);
        }

        public void setInputToWaveStream(Stream source)
        {
            speechRecognitionEngine.SetInputToWaveStream(source);
        }

        public void setInputToAudioStream(Stream source, SpeechAudioFormatInfo info)
        {
            speechRecognitionEngine.SetInputToAudioStream(source, info);
        }

        public void startRecognizeAsyncMultiple()
        {
            speechRecognitionEngine.RecognizeAsync(RecognizeMode.Multiple);
        }
        public void stopRecognizeAsyncMultiple()
        {
            speechRecognitionEngine.RecognizeAsync(RecognizeMode.Multiple);
        }
        public void startRecognizeSync()
        {
            speechRecognitionEngine.Recognize();
        }
        public void startRecognizeAsyncSingle()
        {
            speechRecognitionEngine.RecognizeAsync(RecognizeMode.Single);
        }
        public void stopRecognizeAsyncSingle()
        {
            speechRecognitionEngine.RecognizeAsync(RecognizeMode.Single);
        }

        private SpeechRecognitionEngine speechRecognitionEngine;
        private Grammar dictionGrammar;
    }
}