import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  username: string;
  email: string;
  otp: string;
}
const baseUrl = process.env.BASE_URL || "http://localhost:3000";



const VerificationEmail = ({
  username,
  email,
  otp,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your account on Our Platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Account Verification</Heading>

        <Text style={text}>
          Hello <strong>{username}</strong>, <br />
          Thank you for signing up! Please verify your account using the details
          below:
        </Text>

        <Section style={infoContainer}>
          <Text style={infoText}>
            <strong>Email:</strong> {email}
          </Text>
          <Text style={infoText}>
            <strong>One-Time Password (OTP):</strong>
          </Text>
          <Text style={otpCode}>{otp}</Text>
        </Section>

        <Text style={text}>
          This OTP is valid for <strong>10 minutes</strong>. Enter it on the
          verification page to complete your registration.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={`${baseUrl}/verify/${username}`}>
            Verify Account
          </Button>
        </Section>

        <Text style={text}>
          If you didn&apos;t request this email, please ignore it or contact our
          support team.
        </Text>

        <Text style={footer}>
          Best regards, <br />
          <strong>Your Platform Team</strong>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmail;

// Styles
const main = {
  backgroundColor: "#f9f9f9",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  padding: "20px",
};

const container = {
  margin: "0 auto",
  padding: "20px",
  width: "580px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
};

const h1 = {
  color: "#333",
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center" as const,
  paddingBottom: "20px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  padding: "10px 0",
};

const infoContainer = {
  backgroundColor: "#f1f5f9",
  padding: "15px",
  borderRadius: "6px",
  textAlign: "center" as const,
  marginBottom: "20px",
};

const infoText = {
  color: "#333",
  fontSize: "16px",
  marginBottom: "8px",
};

const otpCode = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#0070f3",
  letterSpacing: "4px",
  backgroundColor: "#eaf4ff",
  padding: "10px",
  borderRadius: "4px",
  display: "inline-block",
};

const buttonContainer = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "5px",
  color: "#ffffff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  width: "200px",
  fontWeight: "bold",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  textAlign: "center" as const,
  marginTop: "20px",
};
