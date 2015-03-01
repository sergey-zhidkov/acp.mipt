import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main401 {
    public static void main(String args[]) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String expression = br.readLine().trim();

        int index = 1;
        for (int i = index; i < expression.length(); i++) {
            char ch = expression.charAt(i);
            if (ch == '^' || ch == 'v') {
                index = i;
                break;
            }
        }

        int first = Integer.parseInt(expression.substring(0, index).trim());
        char operand = expression.charAt(index);
        int second = Integer.parseInt(expression.substring(index + 1).trim());

        int result = 0;
        switch (operand) {
            case '^': result = first & second; break;
            case 'v': result = first | second; break;
        }

        System.out.println(result);
    }
}

