import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.util.*;


class Quiz extends JFrame implements ActionListener {
    JPanel panel;
    JRadioButton choice1;
    JRadioButton choice2;
    JRadioButton choice3;
    JRadioButton choice4;
    ButtonGroup bg;
    JLabel lblmess;
    JButton btnext;
    String[][] qpa;
    String[][] qca;
    int qaid;
    HashMap map;

    Quiz() {
        initializedata();
        setTitle("Quiz Program");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(430, 350);
        setLocation(300, 100);
        setResizable(false);
        Container cont = getContentPane();
        cont.setLayout(null);
        cont.setBackground(Color.GRAY);
        bg = new ButtonGroup();
        choice1 = new JRadioButton("Choice1", true);
        choice2 = new JRadioButton("Choice2", false);
        choice3 = new JRadioButton("Choice3", false);
        choice4 = new JRadioButton("Choice4", false);
        bg.add(choice1);
        bg.add(choice2);
        bg.add(choice3);
        bg.add(choice4);
        lblmess = new JLabel("Choose a correct answer");
        lblmess.setForeground(Color.BLUE);
        lblmess.setFont(new Font("Arial", Font.BOLD, 11));
        btnext = new JButton("Next");
        btnext.setForeground(Color.BLUE);
        btnext.addActionListener(this);
        panel = new JPanel();
        panel.setBackground(Color.LIGHT_GRAY);
        panel.setLocation(10, 10);
        panel.setSize(400, 300);
        panel.setLayout(new GridLayout(6, 2));
        panel.add(lblmess);
        panel.add(choice1);
        panel.add(choice2);
        panel.add(choice3);
        panel.add(choice4);
        panel.add(btnext);
        cont.add(panel);
        setVisible(true);
        qaid = 0;
        readqa(qaid);
    }

    public void actionPerformed(ActionEvent e) {
        if (btnext.getText().equals("Next")) {
            if (qaid &gt;2";
        qpa[6][1] = "1";
        qpa[6][2] = "0";
        qpa[6][3] = "3";
        qpa[6][4] = "-3";

        qpa[7][0] = "How to do exit a loop?";
        qpa[7][1] = "Using exit";
        qpa[7][2] = "Using break";
        qpa[7][3] = "Using continue";
        qpa[7][4] = "Using terminate";

        qpa[8][0] = "What is the correct way to allocate one-dimensional array?";
        qpa[8][1] = "int[size] arr=new int[]";
        qpa[8][2] = "int arr[size]=new int[]";
        qpa[8][3] = "int[size] arr=new int[size]";
        qpa[8][4] = "int[] arr=new int[size]";

        qpa[9][0] = "What is the correct way to allocate two-dimensional array?";
        qpa[9][1] = "int[size][] arr=new int[][]";
        qpa[9][2] = "int arr=new int[rows][cols]";
        qpa[9][3] = "int arr[rows][]=new int[rows][cols]";
        qpa[9][4] = "int[][] arr=new int[rows][cols]";


        //qca stores pairs of question and its correct answer
        qca = new String[10][2];

        qca[0][0] = "How to run Java program on the command prompt?";
        qca[0][1] = "java JavaProgram";

        qca[1][0] = "What is the use of the println method?";
        qca[1][1] = "It is used to print text on the screen with the line break.";

        qca[2][0] = "How to read a character from the keyboard?";
        qca[2][1] = "char c=(char)System.in.read()";

        qca[3][0] = "Which one would be an int";
        qca[3][1] = "2";

        qca[4][0] = "How do you declare an integer variable x?";
        qca[4][1] = "int x";

        qca[5][0] = "How do you convert a string of number to a number?";
        qca[5][1] = "int num=Integer.parseInt(str_num)";

        qca[6][0] = "What is the value of x? int x=3&gt;&gt;2";
        qca[6][1] = "0";

        qca[7][0] = "How to do exit a loop?";
        qca[7][1] = "Using break";

        qca[8][0] = "What is the correct way to allocate one-dimensional array?";
        qca[8][1] = "int[] arr=new int[size]";

        qca[9][0] = "What is the correct way to allocate two-dimensional array?";
        qca[9][1] = "int[][] arr=new int[rows][cols]";


        //create a map object to store pairs of question and selected answer
        map = new HashMap();
    }

    public String getSelection() {
        String selectedChoice = null;
        Enumeration buttons = bg.getElements();
        while (buttons.hasMoreElements()) {
            JRadioButton temp = (JRadioButton) buttons.nextElement();
            if (temp.isSelected()) {
                selectedChoice = temp.getText();
            }
        }
        return (selectedChoice);
    }

    public void readqa(int qid) {
        lblmess.setText("  " + qpa[qid][0]);
        choice1.setText(qpa[qid][1]);
        choice2.setText(qpa[qid][2]);
        choice3.setText(qpa[qid][3]);
        choice4.setText(qpa[qid][4]);
        choice1.setSelected(true);
    }

    public void reset() {
        qaid = 0;
        map.clear();
        readqa(qaid);
        btnext.setText("Next");
    }

    public int calCorrectAnswer() {
        int qnum = 10;
        int count = 0;
        for (int qid = 0; qid &lt; qnum; qid++) {
            if (qca[qid][1].equals(map.get(qid))) {
                count++;
            }
        }
        return count;
    }

    public class Report extends JFrame {
        Report() {
            setTitle(&quot;Answers&quot;);
            setSize(850, 550);
            setBackground(Color.WHITE);
            addWindowListener(new WindowAdapter() {
                public void windowClosing(WindowEvent e) {
                    dispose();
                    reset();
                }
            });
            Draw d = new Draw();
            add(d);
            setVisible(true);
        }

	    class Draw extends Canvas {
	        public void paint(Graphics g) {
	            int qnum = 10;
	            int x = 10;
	            int y = 20;
	            for (int i = 0; i  400) {
	                    y = 20;
	                    x = 450;
	                }
	            }
                //show number of correct answers
                int numc = calCorrectAnswer();
                g.setColor(Color.BLUE);
                g.setFont(new Font("Arial", Font.BOLD, 14));
                g.drawString("Number of correct answers:" + numc, 300, 500);
	        }
        }
    }
}


public class QuizProgram {
    public static void main(String args[]) {
		new Quiz();
	}
}