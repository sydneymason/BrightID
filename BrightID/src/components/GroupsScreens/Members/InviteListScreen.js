import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import api from '@/Api/BrightId';
import { encryptAesKey } from '@/utils/invites';
import EmptyList from '@/components/Helpers/EmptyList';
import MemberCard from './MemberCard';

export class InviteListScreen extends Component<Props, State> {
  renderEligible = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => this.inviteToGroup(item)}>
        <MemberCard {...item} isAdmin={true} />
      </TouchableOpacity>
    );
  };

  inviteToGroup = async (connection) => {
    const { navigation, route } = this.props;
    const group = route.params?.group;

    try {
      const data = await encryptAesKey(group?.aesKey, connection.signingKey);
      await api.invite(connection.id, group?.id, data);
      Alert.alert(
        'Successful Invitaion',
        `You invited ${connection.name} successfully to the group`,
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  getEligibles = () => {
    const { connections, route } = this.props;
    const group = route.params?.group;
    return connections.filter(
      (item) =>
        !group?.members?.includes(item.id) &&
        item.eligible_groups?.includes(group?.id) &&
        (group?.type !== 'primary' || !item.hasPrimaryGroup),
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.mainContainer}>
            <FlatList
              style={styles.eligiblesContainer}
              contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
              data={this.getEligibles()}
              keyExtractor={({ id }, index) => id + index}
              renderItem={this.renderEligible}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyList title="No existing connections are eligible for this group, please come back later.." />
              }
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  eligiblesContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default connect(({ connections }) => ({ ...connections }))(
  InviteListScreen,
);
