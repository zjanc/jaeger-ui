import * as React from 'react';
import { connect } from "react-redux";
import { ReduxState } from "../../../types";
import PropTypes from 'prop-types';
// @ts-ignore
import store from 'store';
// @ts-ignore
import { Field, formValueSelector, reduxForm } from 'redux-form';
import { Col, Row } from 'antd';
import { ActionFunction, Action, ActionMeta } from 'redux-actions';
import { trackSearchOperation, trackSelectService } from '../../Monitor/ServicesView/index.track';
import reduxFormFieldAdapter from '../../../utils/redux-form-field-adapter';
import VirtSelect from '../../common/VirtSelect';
import { bindActionCreators, Dispatch } from 'redux';

import './index.css';
import * as jaegerApiActions from '../../../actions/jaeger-api';

type StateType = {};
type TReduxProps = {
  services: string[];
  servicesLoading: boolean;
  operationsForService: Record<string, string[]>;
  selectedService: string;
  selectedOperation: string;
};
type TDispatchProps = {
  fetchServices: ActionFunction<Action<Promise<any>>>;
  fetchServiceOperations: (serviceName: string) => void;
  fetchCRISPAnalysis: (serviceName: string, operationName: string) => void;
};

type TProps = TReduxProps & TDispatchProps;

const analysisFormSelector = formValueSelector('analysisForm');

const AdaptedVirtualSelect = reduxFormFieldAdapter({
  AntInputComponent: VirtSelect,
  onChangeAdapter: option => (option ? (option as any).value : null),
})

export class CriticalPathViewImpl extends React.PureComponent<TProps, StateType> {
  constructor(props: TProps) {
    super(props);
  }

  componentDidMount() {
    const { fetchServices, services } = this.props;
    fetchServices();
  }

  componentDidUpdate(prevProps: TProps) {
    const { fetchServiceOperations, selectedService, selectedOperation } = this.props;
    if (selectedService && prevProps.selectedService !== selectedService) {
      fetchServiceOperations(selectedService);
    }
    if (selectedOperation && (prevProps.selectedOperation !== selectedOperation || prevProps.selectedService !== selectedService)) {

    }
  }

  fetchAnalysis() {
  }

  getSelectedService() {
    const { selectedService, services } = this.props;
    return selectedService || services[0];
  }

  getSelectedOperation() {
    const { selectedOperation, selectedService, operationsForService } = this.props;
    return selectedOperation || operationsForService[selectedService]
  }

  render() {
    const { services, operationsForService, servicesLoading, selectedService, selectedOperation } = this.props;
    return (
      <>
        <div className="critical-path-container">
          <Row>
            <Col span={16}>
              <h1>Critical Path Analysis for {selectedService} / {selectedOperation}</h1>
            </Col>
          </Row>

          <Row>
            <Col span={6}>
              <h2 className="service-selector-header">Choose service</h2>
              <Field
                name="service"
                component={AdaptedVirtualSelect}
                placeholder="Select A Service"
                props={{
                  className: 'select-a-service-input',
                  value: this.getSelectedService(),
                  disabled: servicesLoading,
                  clearable: false,
                  options: services.map((s: string) => ({ label: s, value: s })),
                  required: true,
                }}
              />
            </Col>
          </Row>

          <Row>
            <Col span={6}>
              <h2 className="operation-selector-header">Choose operation</h2>
              <Field
                name="operation"
                component={AdaptedVirtualSelect}
                placeholder="Select an Operation"
                props={{
                  className: 'select-operation-input',
                  value: this.getSelectedOperation(),
                  disabled: servicesLoading,
                  clearable: false,
                  options: operationsForService[selectedService] ? operationsForService[selectedService].map((s: string) => ({ label: s, value: s })) : [],
                  required: true,
                }}
              />
            </Col>
          </Row>

          <Row>
            <Col span={16}>
              <h3>Critical Path Data</h3>
            </Col>
          </Row>

        </div>
      </>
    )
  }
}

export function mapStateToProps(state: ReduxState): TReduxProps {
  const { services } = state;
  return {
    services: services.services || [],
    servicesLoading: services.loading,
    operationsForService: services.operationsForService,
    selectedService: analysisFormSelector(state, 'service') || store.get('lastAnalysisService'),
    selectedOperation: analysisFormSelector(state, 'operation') || store.get('lastAnalysisOperation'),
  }
}

export function mapDispatchToProps(dispatch: Dispatch<ReduxState>): TDispatchProps {
  const { fetchServices, fetchServiceOperations, fetchCRISPAnalysis } = bindActionCreators<any>(
    jaegerApiActions,
    dispatch
  );

  return {
    fetchServices,
    fetchServiceOperations,
    fetchCRISPAnalysis,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({
    form: 'analysisForm',
  })(CriticalPathViewImpl)
)